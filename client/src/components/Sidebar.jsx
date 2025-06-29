import React, { useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import axios from "axios";
const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser } =
    useContext(ChatContext);
  const navigate = useNavigate();
  const { logout, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchUsers = async () => {
        if (!input.trim()) {
          setFilteredUsers([]);
          return;
        }

        try {
          const res = await axios.get(`/api/v1/user/search`, {
            params: { query: input },
            withCredentials: true,
          });
          setFilteredUsers(res.data.data.users || []);
        } catch (error) {
          console.error("Search error:", error.response?.data || error.message);
          setFilteredUsers([]);
        }
      };

      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [input]);
  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5">
        {/* Top menu */}
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
            />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p
                className="cursor-pointer text-sm"
                onClick={() => {
                  navigate("/profile");
                }}
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              <p
                onClick={() => {
                  logout();
                }}
                className="cursor-pointer text-sm"
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* search bar */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-4 mb-3">
          <img src={assets.search_icon} alt="Search" className="w-4" />
          <input
            onChange={(e) => {
              setInput(e.target.value);
            }}
            type="text"
            className="bg-transparent border-none outline-none text-white placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>

        {/*Searched Users */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col">
            {filteredUsers.map((user, index) => (
              <div
                onClick={() => {
                  setSelectedUser(user);
                }}
                key={index}
                className={`relative flex items-center gap-2 p-2 pl-4 pb-4 rounded-full  cursor-pointer max-sm:text-sm hover:bg-[#282142]/50
${selectedUser?._id === user._id && "bg-[#282142]/50"}`}
              >
                <img
                  src={user.profilePic || assets.avatar_icon}
                  alt="Profile"
                  className="w-[35px] aspect-[1/1] rounded-full"
                />
                <div className=" flex flex-col leading-5">
                  <p>{user.fullName}</p>
                  {onlineUsers.includes(user._id) ? (
                    <span className="text-green-400 text-xs">Online</span>
                  ) : (
                    <span className="text-neutral-400 text-xs">Offline</span>
                  )}
                </div>
                {user.unseenMessages > 0 && (
                  <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                    {user.unseenMessages}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Chating Users list */}
        <div className="flex flex-col">
          {users.map((user, index) => (
            <div
              onClick={() => {
                setSelectedUser(user);
              }}
              key={index}
              className={`relative flex items-center gap-2 p-2 pl-4 pb-4 rounded-full  cursor-pointer max-sm:text-sm hover:bg-[#282142]/50
 ${selectedUser?._id === user._id && "bg-[#282142]/50"}`}
            >
              <img
                src={user.profilePic || assets.avatar_icon}
                alt="Profile"
                className="w-[35px] aspect-[1/1] rounded-full"
              />
              <div className=" flex flex-col leading-5">
                <p>{user.fullName}</p>
                {onlineUsers.includes(user._id) ? (
                  <span className="text-green-400 text-xs">Online</span>
                ) : (
                  <span className="text-neutral-400 text-xs">Offline</span>
                )}
              </div>
              {user.unseenMessages > 0 && (
                <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                  {user.unseenMessages}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
