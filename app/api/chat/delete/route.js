import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 保持数据库连接
let dbConnected = false;

export async function DELETE(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!chatId) {
      return NextResponse.json({
        success: false,
        message: "Chat ID is required",
      });
    }

    // 只在未连接时连接数据库
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }

    // 删除聊天记录
    const result = await Chat.deleteOne({ _id: chatId, userId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Chat not found or already deleted",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to delete chat" 
    });
  }
}
