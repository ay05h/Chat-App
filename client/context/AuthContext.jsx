import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, SetOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/v1/user/check", {
        withCredentials: true,
      });
      if (data.success) {
        setAuthUser(data.data.user);
        connectSocket(data.user);
      }
    } catch (err) {
      try {
        const refresh = await axios.post(
          "/api/v1/user/refresh-token",
          {},
          {
            withCredentials: true,
          }
        );

        if (refresh.data?.accessToken) {
          // Try checking auth again after refresh
          const { data: newData } = await axios.get("/api/v1/user/check", {
            withCredentials: true,
          });
          if (newData.success) {
            setAuthUser(newData.user);
            connectSocket(newData.user);
          }
        }
      } catch (refreshError) {
        setAuthUser(null);
      }
    }
  };

  //Login function
  const login = async (credentials) => {
    try {
      const { data } = await axios.post(`/api/v1/user/login`, credentials, {
        withCredentials: true,
      });
      const user = data.data.user;
      if (data.success && user) {
        setAuthUser(user);
        console.log(user);
        console.log(authUser);
        connectSocket(user);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
      console.error(err);
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
      console.error(err.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { data } = await axios.post(
        "/api/v1/user/logout",
        {},
        {
          withCredentials: true,
        }
      );
      console.log(data);
      if (data.success) {
        setAuthUser(null);
        SetOnlineUsers([]);
        toast.success(data.message);
        socket.disconnect();
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

  //Connect socket Function
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      SetOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
