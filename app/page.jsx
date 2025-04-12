"use client"; // 声明为客户端组件，允许使用React状态和浏览器API

// 导入依赖
import { assets } from "@/assets/assets"; // 静态资源（图标/图片等）
import Message from "@/components/Message";
import PromptBox from "@/components/PromptBox"; // 底部输入框组件
import Sidebar from "@/components/Sidebar"; // 左侧边栏组件
import Image from "next/image"; // Next.js优化图片组件
import { useState } from "react"; // React状态管理库

export default function Home() {
  // 状态定义：
  const [expand, setExpand] = useState(false); // 控制侧边栏展开/折叠状态
  const [messages, setMessages] = useState([]); // 存储聊天消息数组
  const [isLoading, setIsLoading] = useState(false); // 请求加载状态标识

  return (
    <div>
      {/* 主布局容器：flex横向布局，占满整个视口高度 */}
      <div className="flex h-screen">
        {/* 左侧边栏区域 */}
        {/* 传入expand状态控制侧边栏展开/折叠 */}
        <Sidebar expand={expand} setExpand={setExpand} />

        {/* 右侧主内容区域 */}
        {/* flex纵向布局，居中显示，深色背景 */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 bg-[#292a2d] text-white relative">
          {/* 移动端顶部导航栏（仅在小于md屏幕显示） */}
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            {/* 菜单按钮：点击切换侧边栏状态 */}
            <Image
              onClick={() => (expand ? setExpand(false) : setExpand(true))}
              className="rotate-180"
              src={assets.menu_icon}
              alt="菜单图标"
            />
            {/* 聊天标识图标 */}
            <Image
              className="opacity-70"
              src={assets.chat_icon}
              alt="聊天图标"
            />
          </div>

          {/* 条件渲染：当没有消息时显示欢迎语，有消息时显示空div（后续应替换为消息列表） */}
          {messages.length === 0 ? (
            // 欢迎信息区块
            <>
              <div className="flex items-center gap-3">
                <Image src={assets.logo_icon} className="h-16" alt="Logo图标" />
                <p className="text-2xl font-medium">Hi, I'm DeepSeek</p>
              </div>
              <p className="text-sm mt-2">How can I help you today?</p>
            </>
          ) : (
            <div>
              <Message role="user" content="Hello!" />
              <Message role="ai" content="Hello! What can i help you?" />
            </div> // 预留消息列表位置
          )}

          {/* 底部输入框组件 */}
          {/* 传入加载状态及其设置方法 */}
          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />

          {/* 页面底部免责声明（固定定位） */}
          <p className="text-xs absolute bottom-1 text-gray-500">
            AI-generated, for reference only. Cloned by 曾骏瑜
          </p>
        </div>
      </div>
    </div>
  );
}
