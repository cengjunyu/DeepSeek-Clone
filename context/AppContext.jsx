"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState({
    _id: null,
    messages: [],
  });

  const createNewChat = async () => {
    try {
      if (!user) return null;
      const token = await getToken();

      await axios.post(
        "/api/chat/create",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsersChats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUsersChats = async (Retries = 1) => {
    if (Retries > 3) {
      toast.error("Failed to fetch chats after 3 attempts");
      return;
    }
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/chat/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setChats(data.data);

        if (data.data.length === 0) {
          await createNewChat();
          return fetchUsersChats(Retries + 1);
        } else {
          data.data.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );

          setSelectedChat(data.data[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsersChats();
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
  }), [user, chats, setChats, selectedChat, setSelectedChat, fetchUsersChats, createNewChat]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
