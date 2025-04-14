export const maxDuration = 60; // 1 hour
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    const { chatId, prompt } = await req.json();

    if (!userId)
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });

    const data = await Chat.findOne({ _id: chatId, userId });

    console.log("29 ", data);
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.messages.push(userPrompt);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      store: true,
    });

    const aiMessage = {
      role: "assistant", // 确保角色标识正确
      content: completion.choices[0].message.content,
      timestamp: Date.now()
    }

    data.messages.push(aiMessage);
    await data.save();
    console.log("50 ", data);
    return NextResponse.json({ success: true, data: aiMessage });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
