export const maxDuration = 60; // 1 hour
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import connectDB from "@/config/db";

// 保持数据库连接
let dbConnected = false;

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
  timeout: 30000 // 添加超时控制
});

export async function POST(req) {
  // 记录请求开始时间
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 请求开始处理`);
  
  try {
    const { userId } = getAuth(req);
    const { chatId, prompt } = await req.json();

    if (!userId)
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });

    // 确保数据库已连接
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }

    const data = await Chat.findOne({ _id: chatId, userId });

    
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.messages.push(userPrompt);

    // 记录API调用开始时间
    const apiStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] 开始调用DeepSeek API`);
    
    console.time("DeepSeek-API");
    if (true) { // 强制启用流式
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();

      openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "deepseek-chat",
        stream: true // 启用流式
      }).then(async (completionStream) => {
        let fullContent = '';
        for await (const chunk of completionStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }
        // 流结束后保存数据库
        const aiMessage = { 
          role: "assistant", 
          content: fullContent,
          timestamp: Date.now() 
        };
        data.messages.push(aiMessage);
        await data.save(); // 合并为一次保存
        await writer.write(encoder.encode(`data: [DONE]\n\n`));
        await writer.close();
      });
      console.timeEnd("DeepSeek-API");

      return new Response(stream.readable, {
        headers: { 'Content-Type': 'text/event-stream' }
      });
    }
  } catch (error) {
    // 记录错误发生时间
    const errorTime = Date.now();
    const errorDuration = errorTime - startTime;
    console.error(`[${new Date().toISOString()}] 请求处理出错，耗时: ${errorDuration}ms`, error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      timing: {
        error: errorDuration
      }
    });
  }
}
