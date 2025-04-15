import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

const PromptBox = ({ isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = useState("");
  const { user, setChats, selectedChat, setSelectedChat } = useAppContext();

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
      if (isLoading) return toast.error("Wait for the previous prompt to respond");

      setIsLoading(true);
      setPrompt("");

      // 创建用户消息对象
      const userPrompt = {
        role: "user",
        content: prompt,
        timestamp: Date.now(),
      };

      // 立即更新本地消息列表
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === selectedChat._id 
            ? { ...chat, messages: [...chat.messages, userPrompt] } 
            : chat
        )
      );
      
      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, userPrompt],
      }));

      // 创建初始AI消息对象
      const initialAiMessage = {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      // 添加空AI消息到列表
      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, initialAiMessage],
      }));

      // 发送流式请求
      const response = await fetch("/api/chat/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChat._id,
          prompt: promptCopy
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            
            if (dataStr === "[DONE]") {
              // 流式结束，更新最终消息到聊天列表
              setChats(prevChats => 
                prevChats.map(chat => 
                  chat._id === selectedChat._id 
                    ? {
                        ...chat,
                        messages: chat.messages.map((msg, idx) => 
                          idx === chat.messages.length - 1 
                            ? { ...msg, content: fullResponse } 
                            : msg
                        )
                      } 
                    : chat
                )
              );
            } else {
              try {
                const { content, error } = JSON.parse(dataStr);
                if (error) throw new Error(error);
                
                if (content) {
                  fullResponse += content;
                  // 实时更新最后一条消息内容
                  setSelectedChat(prev => {
                    const newMessages = [...prev.messages];
                    const lastIndex = newMessages.length - 1;
                    newMessages[lastIndex] = { 
                      ...newMessages[lastIndex], 
                      content: fullResponse 
                    };
                    return { ...prev, messages: newMessages };
                  });
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
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
        <div className="flex items-center gap-2">
          <div className="relative group">
            <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20">
              <Image className="h-5" src={assets.deepthink_icon} alt="" />
              DeepThink (R1)
            </p>
            <div className="absolute w-max -top-12 left-0 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none">
              深度思考模式(开发中)
              <div className="w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5"></div>
            </div>
          </div>

          <div className="relative group">
            <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20">
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
            type="submit"
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
