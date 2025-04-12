import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server"; // 导入 NextResponse

export async function POST(req) {
  const wh = new Webhook(process.env.SIGNING_SECRET);
  const headerPayload = headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  try {
    // 解析请求体
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const { data, type } = wh.verify(body, svixHeaders);

    // 构造用户信息
    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
      image: data.image_url,
    };

    // 连接数据库
    await connectDB();

    // 根据事件类型处理
    switch (type) {
      case "user.created":
        await User.findOneAndUpdate(
          { _id: data.id },
          userData,
          { upsert: true, new: true }
        );
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
      default:
        break;
    }

    // 返回成功响应
    return NextResponse.json({ message: "event received" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}