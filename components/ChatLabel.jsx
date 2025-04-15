import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

const ChatLabel = ({ openMenu, setOpenMenu, id }) => {
  const { chats, fetchUsersChats, selectedChat, setSelectedChat, setChats } = useAppContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const selectChat = () => {
    const chatData = chats.find((chat) => chat._id === id);
    if (chatData) {
      setSelectedChat(chatData);
    }
  };

  const handleRename = async () => {
    try {
      const newName = prompt("Enter new chat name");
      const { data } = await axios.post("/api/chat/rename", {
        chatId: id,
        name: newName.trim(),
      });
      if (data.success) {
        fetchUsersChats();
        setOpenMenu({ id: 0, open: false });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this chat?"
      );
      if (!confirm) return;

      setIsDeleting(true);
      setOpenMenu({ id: 0, open: false });

      // 立即更新本地状态
      setChats((prevChats) => prevChats.filter((chat) => chat._id !== id));
      
      // 如果删除的是当前选中的聊天，清除选中状态
      if (selectedChat?._id === id) {
        setSelectedChat(null);
      }

      const { data } = await axios.delete("/api/chat/delete", {
        data: { chatId: id },
      });

      if (data.success) {
        toast.success(data.message);
      } else {
        // 如果删除失败，恢复本地状态
        fetchUsersChats();
        toast.error(data.message);
      }
    } catch (error) {
      // 如果发生错误，恢复本地状态
      fetchUsersChats();
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={selectChat}
      className="flex items-center justify-between p-2 text-white/80
    hover:bg-white/10 rounded-lg text-sm group cursor-pointer"
    >
      <p className="group-hover:max-w-5/6 truncate">{chats.find(chat => chat._id === id)?.name || "Untitled Chat"}</p>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenu({ id, open: !openMenu.open });
        }}
        className="group relative flex items-center justify-center h-6 w-6
      aspect-square hover:bg-black/60 rounded-lg"
      >
        <Image
          src={assets.three_dots}
          alt=""
          className={`w-4 ${
            openMenu.id === id && openMenu.open ? "" : "hidden"
          } group-hover:block`}
        />
        <div
          className={`absolute ${
            openMenu.id === id && openMenu.open ? "block" : "hidden"
          } -right-36 top-6 bg-gray-700 rounded-xl w-max p-2`}
        >
          <div className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg">
            <Image
              onClick={(e) => {
                e.stopPropagation();
                handleRename();
              }}
              src={assets.pencil_icon}
              alt=""
              className="w-4"
            />
            <p>Rename</p>
          </div>
          <div className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg">
            <Image
              onClick={handleDelete}
              src={assets.delete_icon}
              alt=""
              className={`w-4 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <p className={isDeleting ? 'opacity-50' : ''}>Delete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLabel;
