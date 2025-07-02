import Message from "../models/message.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/Cloudinary.js";
import { io, userSocketMap } from "../server.js";
import User from "../models/user.model.js";
const getUsersForCurrentUser = async (req, res) => {
  try {
    const userId = req.user?._id;
    const messagedUsersRaw = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $project: {
          user: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$receiver",
              "$sender",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$user",
        },
      },
    ]);

    const userIds = messagedUsersRaw.map((u) => u._id);

    const users = await User.find({ _id: { $in: userIds } }).select(
      "fullName avatar _id bio"
    );

    const unseenCounts = {};
    const countPromises = users.map(async (user) => {
      const count = await Message.countDocuments({
        sender: user._id,
        receiver: userId,
        isRead: false,
      });
      unseenCounts[user._id] = count;
    });
    await Promise.all(countPromises);
    const enrichedUsers = users.map((user) => ({
      _id: user._id,
      fullName: user.fullName,
      avatar: user.avatar,
      bio: user.bio,
      unseenMessages: unseenCounts[user._id] || 0,
    }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { users: enrichedUsers },
          "Users fetched successfully"
        )
      );
  } catch (error) {
    console.log("Error in getUsersForCurrentUser:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

const getAllMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req?.user._id;
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, messages, "Messages fetched successfully"));
  } catch (err) {
    console.error("Error in getAllMessage:", err.message);
    throw new ApiError(500, err.message || "Internal Server Error");
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findOneAndUpdate(
      { _id: messageId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!message) {
      throw new ApiError(404, "Message not found");
    }

    return res.status(200).json(new ApiResponse(200, "Message marked as read"));
  } catch (error) {
    console.error("Error in markMessageAsRead:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const sender = req.user._id;
    const receiver = req.params.userId;

    if (!text?.trim() && !image) {
      throw new ApiError(400, "Message text or image is required");
    }

    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      throw new ApiError(404, "Receiver not found");
    }

    const content = {};
    if (text?.trim()) {
      content.text = text.trim();
    }

    if (image) {
      try {
        const imageUpload = await uploadToCloudinary(image);
        content.image = imageUpload?.secure_url;
      } catch (error) {
        throw new ApiError(500, "Failed to upload image");
      }
    }

    const messageData = {
      sender,
      receiver,
      content,
    };
    const newMessage = await Message.create(messageData);
    const receiverSocketIds = userSocketMap[receiver.toString()];

    if (receiverSocketIds && receiverSocketIds.size > 0) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("newMessage", newMessage);
        io.to(socketId).emit("addToUserList", {
          _id: sender,
          fullName: req.user.fullName,
          profilePic: req.user.profilePic,
          bio: req.user.bio,
        });
      });
    }

    return res
      .status(201)
      .json(new ApiResponse(201, newMessage, "Message sent successfully"));
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

export {
  getUsersForCurrentUser,
  getAllMessage,
  markMessageAsRead,
  sendMessage,
};
