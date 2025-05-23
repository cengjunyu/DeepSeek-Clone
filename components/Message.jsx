import { assets } from "@/assets/assets";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import toast from "react-hot-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

// 加载动画组件
const LoadingDots = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center">
      <span className="text-white/70">思考中{dots}</span>
    </div>
  );
};

const Message = ({ role, content }) => {
  const copyMessage = () => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard");
  };

  // 检查content是否为空
  const isEmpty = !content || content.trim() === "";

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div
        className={`flex flex-col w-full mb-8 ${
          role === "user" && "items-end"
        }`}
      >
        <div
          className={`group relative flex max-w-2xl py-3 rounded-xl ${
            role === "user" ? "bg-[#414158] px-5" : "gap-3"
          } `}
        >
          <div
            className={`opacity-0 group-hover:opacity-100 absolute ${
              role === "user" ? "-left-16 top-2.5" : "left-9 -bottom-6"
            } transition-all`}
          >
            <div className="flex items-center gap-2 opacity-70">
              {role === "user" ? (
                <>
                  <Image
                    onClick={copyMessage}
                    src={assets.copy_icon}
                    alt=""
                    className="w-4 cursor-pointer"
                  />
                  <Image
                    src={assets.pencil_icon}
                    alt=""
                    className="w-4.5 cursor-pointer"
                  />
                </>
              ) : (
                <>
                  <Image
                    onClick={copyMessage}
                    src={assets.copy_icon}
                    alt=""
                    className="w-4.5 cursor-pointer"
                  />
                  <Image
                    src={assets.regenerate_icon}
                    alt=""
                    className="w-4 cursor-pointer"
                  />
                  <Image
                    src={assets.like_icon}
                    alt=""
                    className="w-4 cursor-pointer"
                  />
                  <Image
                    src={assets.dislike_icon}
                    alt=""
                    className="w-4 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>

          {role === "user" ? (
            <>
              <span className="text-white/90">{content}</span>
            </>
          ) : (
            <>
              <Image
                src={assets.logo_icon}
                alt=""
                className="h-9 w-9 p-1 border
              border-white/15 rounded-full"
              />
              <div className="space-y-4 w-full overflow-scroll">
                {isEmpty ? (
                  <LoadingDots />
                ) : (
                  <Markdown
                    components={{
                      code(props) {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                          <SyntaxHighlighter
                            {...rest}
                            PreTag="div"
                            children={String(children).replace(/\n$/, "")}
                            language={match[1]}
                            style={atomDark}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {content}
                  </Markdown>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
