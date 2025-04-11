import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export const POST = async (req) => {
  const wh = new Webhook(process.env.SIGNING_SECRET);
  const headerPayload = await headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  //Get the payload and verify the signature
  const payload = await req.json();
  const body = JSON.stringify(payload);
  const { data, type } = wh.verify(body, svixHeaders);

  //Prepare the user data to be saved in the database
  const userData = {
    _id: data.id,
    name: `${data.first_name} ${data.last_name}`,
    email: data.email_address[0].email_address,
    image: data.image_url,
  };

  await connectDB();
  switch (type) {
    case "user.created":
      try {
        await User.create(userData);
      } catch (error) {
        console.error("Error creating user:", error);
      }
      break;
    case "user.updated":
      try {
        await User.findByIdAndUpdate(data.id, userData);
      } catch (error) {
        console.error("Error updating user:", error);
      }
      break;
    case "user.deleted":
      try {
        await User.findByIdAndDelete(data.id);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
      break;
  }

  return NextRequest.json({message:"Event received successfully"}); // Return a success message
};
