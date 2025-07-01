import React, { useEffect, useState, useCallback } from "react";
import { Typewriter } from "react-simple-typewriter";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import axios from "axios";
import { Send, MoreVertical, Search } from "lucide-react";
const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, setUsers } =
    useContext(ChatContext);
  const navigate = useNavigate();
  const { logout, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const userSelectionProcess = useCallback(
    (selectUser) => {
      setSelectedUser(selectUser);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === selectUser._id ? { ...user, unseenMessages: 0 } : user
        )
      );
      setInput("");
      setFilteredUsers([]);
      setIsSearching(false);
    },
    [setSelectedUser, setUsers]
  );

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  // Debounced search effect
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!input.trim()) {
        setFilteredUsers([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const res = await axios.get(`/api/v1/user/search`, {
          params: { query: input.trim() },
          withCredentials: true,
        });

        const searchResults = res.data.data.users || [];

        setFilteredUsers(searchResults);
      } catch (error) {
        console.error("Search error:", error.response?.data || error.message);
        setFilteredUsers([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [input, users]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const clearSearch = () => {
    setInput("");
    setFilteredUsers([]);
    setIsSearching(false);
  };

  const renderUserItem = (user, isFromSearch = false) => (
    <div
      onClick={() => {
        userSelectionProcess(user);
        clearSearch();
      }}
      key={user._id}
      className={`relative flex items-center gap-2 p-2 pl-4 pb-4 rounded-full cursor-pointer max-sm:text-sm hover:bg-[#282142]/50 transition-colors duration-200
        ${selectedUser?._id === user._id ? "bg-[#282142]/50" : ""}
        ${isFromSearch ? "border-l-2 border-blue-400" : ""}`}
    >
      <img
        src={
          user.profilePic ||
          `https://ui-avatars.com/api/?name=${user.fullName}&background=6366f1&color=fff&bold=true`
        }
        alt="Profile"
        className="w-[35px] aspect-[1/1] rounded-full object-cover"
      />
      <div className="flex flex-col leading-5 flex-1">
        <p className="truncate">{user.fullName}</p>
        {onlineUsers.includes(user._id) ? (
          <span className="text-green-400 text-xs">Online</span>
        ) : (
          <span className="text-neutral-400 text-xs">Offline</span>
        )}
      </div>
      {!isFromSearch && user.unseenMessages > 0 && (
        <div className="absolute top-2 right-2 text-xs h-5 min-w-[20px] flex justify-center items-center rounded-full bg-violet-500 text-white px-1">
          {user.unseenMessages > 99 ? "99+" : user.unseenMessages}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5">
        {/* Top menu */}
        <div className=" flex justify-between  items-center ">
          <div className="flex items-center gap-2">
            <div className=" w-12 h-12 pr-1 pt-1 bg-white/10 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-700/30 to-blue-700/30 backdrop-blur-xl shadow-lg animate-pulse ">
              <Send className="w-8 h-8 text-white/60" />
            </div>
            <p className="text-3xl font-bold text-gray-400  bg-clip-text">
              <Typewriter
                words={["Chatterly"]}
                loop={0}
                cursor
                cursorStyle="_"
                typeSpeed={100}
                deleteSpeed={75}
                delaySpeed={5000}
              />
            </p>
          </div>

          <div className="relative py-2 group">
            <MoreVertical className="max-h-5 cursor-pointer" />

            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p
                className="cursor-pointer text-sm hover:text-blue-400 transition-colors"
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              <p
                onClick={logout}
                className="cursor-pointer text-sm hover:text-red-400 transition-colors"
              >
                Logout
              </p>
            </div>
          </div>
        </div>
        {/* Search bar */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-4 mb-3">
          <Search className="w-5" />
          <input
            value={input}
            onChange={handleInputChange}
            type="text"
            className="bg-transparent border-none outline-none text-white placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
          {input && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        {/* Loading indicator */}
        {isSearching && (
          <div className="text-center py-2 text-gray-400 text-sm">
            Searching...
          </div>
        )}
        {/* Search Results */}
        {input && filteredUsers.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm text-gray-400 mb-2 px-2">Search Results</h3>
            <div className="flex flex-col max-h-48 overflow-y-auto">
              {filteredUsers.map((user) => renderUserItem(user, true))}
            </div>
            <hr className="my-3 border-gray-600" />
          </div>
        )}
        {/* No search results */}
        {input && !isSearching && filteredUsers.length === 0 && (
          <div className="text-center py-2 text-gray-400 text-sm mb-4">
            No users found for "{input}"
          </div>
        )}
        {/* Chat Users List */}
        {filteredUsers.length === 0 && (
          <div className="flex flex-col">
            {users.length > 0 ? (
              <>
                {!input && (
                  <h3 className="text-sm text-gray-400 mb-2 px-2">
                    Recent Chats
                  </h3>
                )}
                {users.map((user) => renderUserItem(user, false))}
              </>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">
                No conversations yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
