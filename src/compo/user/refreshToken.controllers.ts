import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { Request, Response } from "express";
// import User model here
// import User from "../models/User"; 
import User from "../../model/user.js";
const refreshTokengen = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error("REFRESH_TOKEN_SECRET missing");
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ) as JwtPayload & { _id: string };

    const user = await User.findById(payload._id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = await user.generateAccessToken();
    const newRefreshToken = await user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
       sameSite: "none" as const
    };

    return res
      .cookie("accessToken", newAccessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .status(200)
      .json({ message: "Token refreshed" });

  } catch {
    return res.status(401).json({ message: "Refresh failed" });
  }
};


export default refreshTokengen;
