import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req) {
  // Initialize Svix Webhook with signing secret
  const signingSecret = process.env.SIGNING_SECRET;
  if (!signingSecret) {
    console.error("SIGNING_SECRET is not set in environment variables");
    return NextRequest.json({ message: "Server configuration error" }, { status: 500 });
  }
  const wh = new Webhook(signingSecret);

  // Extract Svix headers
  const headerPayload = headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  // Verify webhook payload
  let payload, data, type;
  try {
    payload = await req.json();
    const body = JSON.stringify(payload);
    ({ data, type } = wh.verify(body, svixHeaders));
  } catch (error) {
    console.error("Webhook verification failed:", error.message);
    return NextRequest.json({ message: "Invalid webhook signature" }, { status: 400 });
  }

  // Validate payload data
  if (!data || typeof data !== "object") {
    console.error("Invalid payload data:", data);
    return NextRequest.json({ message: "Invalid payload" }, { status: 400 });
  }

  const { email_addresses, first_name, last_name, id, image_url } = data;
  if (!email_addresses || !Array.isArray(email_addresses) || email_addresses.length === 0) {
    console.error("Missing or invalid email_addresses:", email_addresses);
    return NextRequest.json({ message: "Email address is required" }, { status: 400 });
  }

  // Construct userData with fallbacks
  const userData = {
    _id: id,
    email: email_addresses[0].email_address,
    name: `${first_name || "Unknown"} ${last_name || ""}`.trim() || "Unknown User",
    image: image_url || "",
  };

  // Connect to database and process event
  try {
    await connectDB();
    switch (type) {
      case "user.created":
        await User.create(userData);
        break;
      case "user.updated":
        await User.findByIdAndUpdate(id, userData);
        break;
      case "user.deleted":
        await User.findByIdAndDelete(id);
        break;
      default:
        console.log("Unhandled event type:", type);
        break;
    }
    return NextRequest.json({ message: "Event received and processed" });
  } catch (error) {
    console.error("Database operation failed:", error.message);
    return NextRequest.json({ message: "Internal server error" }, { status: 500 });
  }
}