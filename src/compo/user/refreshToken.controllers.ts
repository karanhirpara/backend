import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { Request, Response } from "express";
// import User model here
// import User from "../models/User"; 
import User from "../../model/user.js";
const refreshTokengen = async (req: Request, res: Response) => {
  try {
    
    const refreshtoken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshtoken) {
      throw new Error("Refresh token is required");
    }

    
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables");
    }

    // ✅ Verify token
    const decrypt = jwt.verify(
      refreshtoken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as JwtPayload & { _id: string };

    if (!decrypt || !decrypt._id) {
      throw new Error("Invalid refresh token");
    }

    // ✅ Always await mongoose calls
    const user = await User.findById(decrypt._id);
    if (!user) {
      throw new Error("User not found");
    }

    if (refreshtoken !== user.refreshToken) {
      throw new Error("Refresh token does not match");
    }

    const newrefreshtoken = await user.generateRefreshToken();
    const accesstoken = await user.generateAccessToken();

    user.refreshToken = newrefreshtoken;
    await user.save({ validateBeforeSave: false });

    const userview = await User.findById(user._id).select(
      "-refreshToken -password"
    );

    const options = {
      httpOnly: true,
      secure: true, // ⚠️ only works over HTTPS
    };

    return res
      .status(200)
      .cookie("AccessToken", accesstoken, options)
      .cookie("RefreshToken", newrefreshtoken, options)
      .json({
        newrefreshtoken,
        accesstoken,
        userview,
      });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
};

export default refreshTokengen;
