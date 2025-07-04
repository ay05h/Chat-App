import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import User from "./../models/user.model.js";
export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(new ApiError(401, "Unauthorized request"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(new ApiError(401, "Invalid Access Token!"));
    }

    req.user = user;
    next();
  } catch (err) {
    next(new ApiError(401, err?.message || "Invalid access token"));
  }
};
