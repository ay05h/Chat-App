import React, { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log("backend :", backendUrl);
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, SetOnlineUsers] = useState([]);

  const socketRef = useRef(null);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/v1/user/check", {
        withCredentials: true,
      });
      if (data.success) {
        setAuthUser(data.data.user);
        connectSocket(data.data.user);
      }
    } catch (err) {
      try {
        const refresh = await axios.post(
          "/api/v1/user/refresh-token",
          {},
          { withCredentials: true }
        );
        if (refresh.data?.accessToken) {
          const { data } = await axios.get("/api/v1/user/check", {
            withCredentials: true,
          });
          if (data.success) {
            setAuthUser(data.data.user);
            connectSocket(data.data.user);
          }
        }
      } catch {
        setAuthUser(null);
      }
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await axios.post(`/api/v1/user/login`, credentials, {
        withCredentials: true,
      });
      const user = data.data.user;
      if (data.success && user) {
        setAuthUser(user);
        connectSocket(user);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    }
  };

  const signup = async (credentials) => {
    try {
      const { data } = await axios.post(`/api/v1/user/signup`, credentials, {
        withCredentials: true,
      });
      if (data.success) {
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "SignUp Failed");
      return false;
    }
  };

  const logout = async () => {
    try {
      const { data } = await axios.post(
        "/api/v1/user/logout",
        {},
        { withCredentials: true }
      );

      if (data.success) {
        setAuthUser(null);
        SetOnlineUsers([]);
        toast.success(data.message);
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.patch("/api/v1/user/update-profile", body, {
        withCredentials: true,
      });
      setAuthUser(data.data.user);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const connectSocket = (userData) => {
    if (!userData) return;

    if (socketRef.current) {
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
      socketRef.current.off("getOnlineUsers");
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
      withCredentials: true,
      transports: ["websocket"],
      secure: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      SetOnlineUsers(userIds);
    });

    socketRef.current = newSocket;
  };

  useEffect(() => {
    checkAuth();
    return () => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket: socketRef.current,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
