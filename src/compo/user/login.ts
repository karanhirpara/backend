
import User from "../../model/user.js";

const userlogin = async (req: any, res: any) => {
  try {
    console.log("req.body", req.body);
  
    const { email ,password } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Username or email is required" });
    }

    const checkUser = await User.findOne({ email: email.toLowerCase() });

    if (!checkUser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const passwordMatch = await checkUser.isPasswordCorrect(password);
    console.log("passwordMatch", passwordMatch);  
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    
    // Generate tokens
    let accessToken=""
    try {
       accessToken = await checkUser.generateAccessToken();
    } catch (error) {
     
      return res.status(500).json({ message: "Something went wrong" });
    }
    

   console.log("accessToken",accessToken)
    const refreshToken = await checkUser.generateRefreshToken();
    
    // Save refresh token in DB
    checkUser.refreshToken = refreshToken;
    await checkUser.save({ validateBeforeSave: false });

    // Remove sensitive fields
    const userView = await User.findById(checkUser._id).select(
      "-password -refreshToken"
    );

   const cookieOptions = {
  httpOnly: true,
  secure: false,
   sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

return res
  .status(200)
  .cookie("accessToken", accessToken, cookieOptions)
  .cookie("refreshToken", refreshToken, cookieOptions)
  .json({
    message: "Login successful",
    user: userView,
  });

  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export default userlogin;
