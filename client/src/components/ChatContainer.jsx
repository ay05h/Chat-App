import React, { useContext, useEffect, useRef, useState } from "react";
import { formatTime } from "../../utils/formatTime";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Send,
  Image,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  X,
  Download,
  ArrowLeft,
} from "lucide-react";

const ChatContainer = () => {
  const scrollEnd = useRef();
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);

    try {
      if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const messageData = { image: reader.result };
            if (input.trim()) {
              messageData.text = input.trim();
            }

            await sendMessage(messageData);
            resetMessageInput();
          } catch (err) {
            toast.error("Failed to send image message");
          } finally {
            setSending(false);
          }
        };
        reader.readAsDataURL(selectedFile);
      } else if (input.trim() !== "") {
        await sendMessage({ text: input.trim() });
        resetMessageInput();
        setSending(false);
      } else {
        setSending(false);
      }
    } catch (err) {
      toast.error("Failed to send message");
      setSending(false);
    }
  };

  const resetMessageInput = () => {
    setInput("");
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("select an image file");
      return;
    }

    // Validate file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image size should be less than 3MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const cancelImagePreview = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Emoji
  const commonEmojis = [
    "😀",
    "😂",
    "🥰",
    "😍",
    "🤔",
    "👍",
    "👎",
    "❤️",
    "🔥",
    "💯",
    "😢",
    "😮",
    "😡",
    "🎉",
    "👏",
  ];

  const addEmoji = (emoji) => {
    setInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const featureNotAvailable = () => {
    toast.error("This feature will be in next version. Please wait till then");
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg flex flex-col">
      {/* Head area */}
      <div className=" w-full  flex items-center gap-3 p-4  border-b border-stone-500/30 bg-black/20 backdrop-blur-lg rounded-t-lg">
        <img
          src={
            selectedUser.profilePic ||
            `https://ui-avatars.com/api/?name=${selectedUser.fullName}&background=6366f1&color=fff&bold=true`
          }
          alt=""
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
        />
        <div className="flex-1">
          <p className="text-lg text-white font-medium flex items-center gap-2">
            {selectedUser.fullName}
            {onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-lg animate-pulse"></span>
            )}
          </p>
          <p className="text-sm text-gray-300">
            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              featureNotAvailable();
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors group max-md:hidden"
          >
            <Phone className="w-5 h-5 text-gray-300 group-hover:text-white" />
          </button>
          <button
            onClick={() => {
              featureNotAvailable();
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors group max-md:hidden"
          >
            <Video className="w-5 h-5 text-gray-300 group-hover:text-white" />
          </button>
          <button
            onClick={() => {
              featureNotAvailable();
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors group max-md:hidden"
          >
            <MoreVertical className="w-5 h-5 text-gray-300 group-hover:text-white" />
          </button>
          <button
            onClick={() => setSelectedUser(null)}
            className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* chat area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-3 pb-6 space-y-4">
        {messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-white/60" />
              </div>
              <p className="text-white/60">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          messages?.map((msg, index) => {
            const isOwnMessage = msg?.sender === authUser._id;
            const showDateSeparator =
              index === 0 ||
              new Date(msg.createdAt).toDateString() !==
                new Date(messages[index - 1].createdAt).toDateString();

            return (
              <div key={index}>
                {showDateSeparator && (
                  <div className="flex justify-center my-4">
                    <span className="bg-black/30 text-white/70 text-xs px-3 py-1 rounded-full backdrop-blur-md">
                      {new Date(msg.createdAt).toDateString() ===
                      new Date().toDateString()
                        ? "Today"
                        : new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div
                  className={`flex items-end gap-2 ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-end gap-2 ${
                      isOwnMessage ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    {/* Message content */}
                    <div className="max-w-[280px] group relative">
                      {msg?.content?.image ? (
                        <div className="relative">
                          <img
                            src={msg.content.image}
                            alt=""
                            className="max-w-full border border-gray-600 rounded-lg overflow-hidden mb-2 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                            onClick={() =>
                              window.open(msg.content.image, "_blank")
                            }
                          />
                          {msg?.content?.text && (
                            <p
                              className={`p-3 rounded-lg mt-2 break-words text-sm ${
                                isOwnMessage
                                  ? "bg-violet-500/40 text-white rounded-br-none backdrop-blur-md"
                                  : "bg-white/20 text-white rounded-bl-none backdrop-blur-md"
                              }`}
                            >
                              {msg?.content?.text}
                            </p>
                          )}
                          <button
                            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() =>
                              window.open(msg.content.image, "_blank")
                            }
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p
                          className={`p-3 rounded-lg break-words text-sm shadow-lg backdrop-blur-md ${
                            isOwnMessage
                              ? "bg-violet-500/40 text-white rounded-br-none"
                              : "bg-white/20 text-white rounded-bl-none"
                          }`}
                        >
                          {msg?.content?.text}
                        </p>
                      )}
                    </div>

                    {/* Sender avatar and timestamp */}
                    <div className="text-center text-xs flex flex-col items-center space-y-1">
                      <img
                        src={
                          isOwnMessage
                            ? authUser?.profilePic ||
                              `https://ui-avatars.com/api/?name=${authUser.fullName}&background=6366f1&color=fff&bold=true`
                            : selectedUser?.profilePic ||
                              `https://ui-avatars.com/api/?name=${selectedUser.fullName}&background=6366f1&color=fff&bold=true`
                        }
                        alt=""
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30"
                      />
                      <p className="text-gray-400 text-xs">
                        {formatTime(msg?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 py-3 border-t border-stone-500/30 bg-black/30 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border-2 border-gray-400"
                />
                <button
                  onClick={cancelImagePreview}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {selectedFile?.name}
                </p>
                <p className="text-xs text-gray-300">
                  {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                  MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="px-4 py-3 border-t border-stone-500/30 bg-black/30 backdrop-blur-md">
          <div className="flex flex-wrap gap-2">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                className="text-xl hover:bg-white/10 rounded-lg p-2 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* bottom area */}
      <div className="flex items-center gap-3 p-3 border-t border-stone-500/30 bg-black/20 backdrop-blur-md">
        <div className="flex space-x-2">
          <label className="cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors group">
            <Image className="w-5 h-5 text-gray-300 group-hover:text-white" />
            <input
              ref={fileInputRef}
              onChange={handleSendImage}
              type="file"
              id="image"
              accept="image/png, image/jpeg"
              hidden
            />
          </label>
          <button
            onClick={() => {
              featureNotAvailable();
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
          >
            <Paperclip className="w-5 h-5 text-gray-300 group-hover:text-white" />
          </button>
        </div>

        <div className="flex-1 flex items-center bg-white/10 px-4 rounded-full backdrop-blur-md border border-white/20">
          <input
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (!sending && e.key === "Enter") {
                handleSendMessage(e);
              }
            }}
            value={input}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none bg-transparent outline-none text-white placeholder-gray-400"
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full transition-colors ${
              showEmojiPicker
                ? "bg-violet-500/30 text-violet-300"
                : "hover:bg-white/10 text-gray-300"
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleSendMessage}
          disabled={sending || (!input.trim() && !selectedFile)}
          className="p-3 bg-violet-500 text-white rounded-full hover:bg-violet-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  ) : (
    // No user selected
    <div className="flex flex-col items-center justify-center gap-4 text-gray-500 bg-gradient-to-br from-violet-900/20 to-blue-900/20 backdrop-blur-lg max-md:hidden h-full">
      <div className="w-32 h-32 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10">
        <Send className="w-16 h-16 text-white/60" />
      </div>
      <div className="text-center">
        <p className="text-xl font-medium text-white mb-2">
          Chat anytime, anywhere
        </p>
        <p className="text-gray-300 text-sm">
          Select a conversation to start messaging
        </p>
      </div>
      <div className="flex space-x-4 text-sm text-gray-400">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Real-time messaging
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          Image sharing
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
