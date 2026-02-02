import JWT from "jsonwebtoken";
import User from "../model/user.js";
import dotenv from "dotenv";
dotenv.config();

export const verifyuser = async (req: any, res: any, next: any) => {
  try {
   
    // ✅ Extract token from cookies or Authorization header
    const accessToken =
  req.cookies?.accessToken ||
  req.headers.authorization?.replace("Bearer ", "");


    if (!accessToken) {
      return res.status(401).json({ message: "Access token not provided" });
    }
   
    // ✅ Check if secret exists
    if (!process.env.ACCESS_TOKEN_SECRET) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    
    
    // ✅ Verify token
    const checkaccesstoken: any = JWT.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    // ✅ Find user
    const user = await User.findById(checkaccesstoken.id || checkaccesstoken._id)
      .select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({ message: "Invalid access token or user not found" });
    }

    // ✅ Attach user data to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error: any) {
    // ✅ Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Access token expired" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid access token" });
    }
    
    // ✅ Handle other errors
    console.error('Authentication error:', error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};



