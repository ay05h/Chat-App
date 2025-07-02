import { createContext, useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { useEffect } from "react";
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { socket, axios } = useContext(AuthContext);

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/v1/messages/users", {
        withCredentials: true,
      });
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      toast.message(error.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/v1/messages/${userId}`, {
        withCredentials: true,
      });
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (msg) => {
    try {
      const { data } = await axios.post(
        `/api/v1/messages/send/${selectedUser._id}`,
        msg,
        { withCredentials: true }
      );
      if (data.success) {
        setMessages((prevMsg) => [...prevMsg, data.data]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const subscribeToMessage = () => {
    if (!socket || socket.disconnected) return;
    socket.off("newMessage");
    socket.off("addToUserList");
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.sender === selectedUser._id) {
        newMessage.isRead = true;
        setMessages((prevMsg) => [...prevMsg, newMessage]);
        axios.put(`/api/v1/messages/messages/${newMessage._id}/read`);
      } else {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === newMessage.sender
              ? { ...user, unseenMessages: (user.unseenMessages || 0) + 1 }
              : user
          )
        );
      }
    });
    socket.on("addToUserList", (newUser) => {
      setUsers((prevUsers) => {
        const exists = prevUsers.some((u) => u._id === newUser._id);
        if (!exists) {
          return [
            {
              ...newUser,
              unseenMessages: 1,
            },
            ...prevUsers,
          ];
        }
        return prevUsers;
      });
    });
  };

  const unSubscribeToMessage = () => {
    if (!socket) return;
    socket.off("newMessage");
    socket.off("addToUserList");
  };

  useEffect(() => {
    if (socket?.connected) {
      subscribeToMessage();
    } else if (socket) {
      socket.once("connect", subscribeToMessage);
    }
    return () => unSubscribeToMessage();
  }, [socket, selectedUser]);
  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    sendMessage,
    setSelectedUser,
    getMessages,
    setUsers,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
