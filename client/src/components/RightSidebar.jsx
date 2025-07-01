import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { X, Image } from "lucide-react";

const RightSidebar = () => {
  const { selectedUser, messages, setSelectedUser } = useContext(ChatContext);
  const { onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImage] = useState([]);

  useEffect(() => {
    setMsgImage(
      messages
        .filter((msg) => msg.content.image)
        .map((msg) => msg.content.image)
    );
  }, [messages]);

  return (
    selectedUser && (
      <div
        className={`bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-900/95 backdrop-blur-xl border-l border-white/10 text-white w-full relative overflow-hidden h-full flex flex-col ${
          selectedUser ? "max-md:hidden" : ""
        }`}
      >
        {/* Part 1: Profile Section - Fixed, no scroll */}
        <div className="flex-shrink-0 pt-8 pb-6 flex flex-col items-center gap-4 text-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-violet-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <img
              src={
                selectedUser?.profilePic ||
                `https://ui-avatars.com/api/?name=${selectedUser.fullName}&background=6366f1&color=fff&bold=true`
              }
              alt="Profile"
              className="relative w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl transition-transform duration-300 group-hover:scale-105"
            />
            {/* Online indicator with pulse animation */}
            {onlineUsers.includes(selectedUser._id) && (
              <div className="absolute -bottom-1 -right-1">
                <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900 shadow-lg">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 px-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {selectedUser.fullName}
            </h1>
            {selectedUser.bio && (
              <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
                {selectedUser.bio}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div
                className={`w-2 h-2 rounded-full ${
                  onlineUsers.includes(selectedUser._id)
                    ? "bg-green-400"
                    : "bg-gray-500"
                }`}
              ></div>
              <span>
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex-shrink-0 px-6">
          <hr className="border-white/20 mb-6" />
        </div>

        {/* Part 2: Media Section - Scrollable */}
        <div className="flex-1 overflow-hidden px-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-purple-400 to-violet-600 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-200">
              Shared Media
            </h3>
            <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full ml-auto">
              {msgImages.length}
            </span>
          </div>

          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-4">
            {msgImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {msgImages.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => window.open(img)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl bg-white/5 aspect-square transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                  >
                    <img
                      src={img}
                      alt="Media"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 ring-1 ring-white/20 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <Image className="w-8 h-8 text-gray-400 " />
                </div>
                <p className="text-sm text-gray-400">No media shared yet</p>
              </div>
            )}
          </div>
        </div>

        {/* {button} */}
        <div className="flex-shrink-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent p-6">
          <button
            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-medium py-3 px-6 rounded-2xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:-translate-y-0.5 active:scale-95"
            onClick={() => setSelectedUser(null)}
          >
            <span className="flex items-center justify-center gap-2">
              Close
              <X className="w-5 h-5" />
            </span>
          </button>
        </div>
      </div>
    )
  );
};

export default RightSidebar;
