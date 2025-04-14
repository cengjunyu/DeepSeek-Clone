import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

const PromptBox = ({ isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = useState("");

  const { user, chats, setChats, selectedChat, setSelectedChat } =
    useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    const promptCopy = prompt;

    try {
      e.preventDefault();
      if (!user) return toast.error("Login to send a message");
      if (isLoading)
        return toast.error("Wait for the previous prompt to respond");

      setIsLoading(true);

      setPrompt("");

      const userPrompt = {
        role: "user",
        content: prompt,
        timestamp: Date.now(),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, messages: [...chat.messages, userPrompt] }
            : chat
        )
      );

      console.log(chats);

      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, userPrompt],
      }));

      console.log(selectedChat);

      const { data } = await axios.post("/api/chat/ai", {
        chatId: selectedChat._id,
        prompt: promptCopy,
      });

      console.log(data);

      if (data.success) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, messages: [...chat.messages, data.data] }
              : chat
          )
        );

        const message = data.data.content;
        const messageTokens = message.split(" ");
        let assistantMessage = {
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }));

        for (let i = 0; i < messageTokens.length; i++) {
          setTimeout(() => {
            assistantMessage.content = messageTokens.slice(0, i + 1).join(" ");
            setSelectedChat((prev) => {
              const updatedMessages = [
                ...prev.messages.slice(0, -1),
                assistantMessage,
              ];
              return { ...prev, messages: updatedMessages };
            });
          }, i * 100);
        }
      } else {
        console.log(data.message);
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full ${
        selectedChat?.messages.length > 0 ? "max-w-3xl" : "max-w-2xl"
      } bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message DeepSeek"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 ">
          <div className="relative group">
            <p
              className="flex items-center gap-2 text-xs border border-gray-300/40
          px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20"
            >
              <Image className="h-5" src={assets.deepthink_icon} alt="" />
              DeepThink (R1)
            </p>
            <div className="absolute w-max -top-12 left-0 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none">
              深度思考模式(开发中)
              <div className="w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5"></div>
            </div>
          </div>

          <div className="relative group">
            <p
              className="flex items-center gap-2 text-xs border border-gray-300/40
          px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20"
            >
              <Image className="h-5" src={assets.search_icon} alt="" />
              Search
            </p>
            <div className="absolute w-max -top-12 left-0 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none">
              联网搜索(开发中)
              <div className="w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="" />

          <button
            className={`${
              prompt ? "bg-primary" : "bg-[#71717a]"
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
              style={{ height: "auto" }}
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
