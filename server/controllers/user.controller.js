import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/Cloudinary.js";
import { generateAccessAndRefereshToken } from "../utils/generateToken.js";
import { ApiError } from "./../utils/ApiError.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const isProd = process.env.NODE_ENV === "production";
const options = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "None" : "Lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signup = async (req, res) => {
  try {
    const { email, fullName, password, bio, profilePic } = req.body;
    if (
      [email, fullName, password, bio].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All Fields are required.");
    }
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      throw new ApiError(409, "Email already exist !");
    }
    let profilePicURL = "";
    if (profilePic) {
      const profileResponse = await uploadToCloudinary(profilePic);
      profilePicURL = profileResponse?.secure_url;
    }

    const user = await User.create({
      email,
      fullName: fullName.trim(),
      profilePic: profilePicURL,
      password,
      bio: bio.trim(),
    });

    if (!user) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    const userObj = user.toObject();
    delete userObj.password;

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { user: userObj },
          "Account created! Please log in. "
        )
      );
  } catch (err) {
    console.log(err.message);
    throw new ApiError(500, err.message);
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.isPasswordCorrect(password))) {
      throw new ApiError(401, "Invalid credentials!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
      user._id
    );

    const userObj = user.toObject();
    delete userObj.password;

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: userObj,
            accessToken,
            refreshToken,
          },
          "Login successful!"
        )
      );
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(err.statusCode || 500)
      .json(
        new ApiResponse(
          err.statusCode || 500,
          null,
          err.message || "Internal Server Error"
        )
      );
  }
};

const logout = async (req, res) => {
  const userId = req.user._id;
  try {
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshToken: "",
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, { data: "hello" }, "Logout Successfull"));
  } catch (err) {
    console.error("Logout Error:", err);
    throw new ApiError(500, "Error while logging out");
  }
};

const refreshAccessToken = async (req, res) => {
  const inComingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!inComingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      inComingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (inComingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used!");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshToken(user._id); // updates token in DB

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (err) {
    throw new ApiError(401, err?.message || "Invalid refresh token");
  }
};

const checkAuth = (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, "User Auth"));
};

const updateProfile = async (req, res) => {
  const bio = req.body.bio?.trim();
  const fullName = req.body.fullName?.trim();
  const profilePic = req.body.profilePic?.trim();

  if (!bio || !fullName) {
    throw new ApiError(400, "Full name and bio are required");
  }

  try {
    let updateFields = { bio, fullName };

    if (profilePic) {
      const profile = await uploadToCloudinary(profilePic);
      if (!profile?.secure_url) {
        throw new ApiError(500, "Profile image upload failed");
      }
      updateFields.profilePic = profile.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updateFields },
      { new: true }
    ).select("-password -refreshToken");

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: updatedUser },
          "Profile updated successfully"
        )
      );
  } catch (err) {
    console.error("Error updating profile:", err);
    throw new ApiError(500, "Error updating profile");
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = req.query.query?.trim();
    if (!query) {
      throw new ApiError(400, "Query required");
    }

    const users = await User.find({
      fullName: { $regex: query, $options: "i" },
      _id: { $ne: req.user._id },
    }).select("_id fullName avatar bio");

    res.status(200).json(new ApiResponse(200, { users }, "Users fetched"));
  } catch (error) {
    console.error("Search error:", error);
    throw new ApiError(500, "Server error while searching users ");
  }
};

export {
  signup,
  login,
  logout,
  refreshAccessToken,
  updateProfile,
  checkAuth,
  searchUsers,
};
