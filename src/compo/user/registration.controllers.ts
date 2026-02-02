import User from "../../model/user.js";
 
const userregistration = async (req:any, res:any) => {
  try {
    const { username,email, password } = req.body;

    console.log("req.body", req.body);
    // Validate input
    if (!username?.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }
    if (!password?.trim()) {
      return res.status(400).json({ message: "Password is required" });
    }
    if(!email?.trim()){
      return res.status(400).json({ message: "email is required" });
    }
    // Check if username already exists
    const existedUser = await User.findOne({ username: username.toLowerCase() });
    
    if (existedUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
     
   
    // Create new user (password will be hashed in model pre-save hook)
    const newUser = await User.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
    });
    console.log("newUser",newUser)
    // Exclude password & refreshToken before sending response
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
    console.log("createdUser",createdUser)
    return res.status(201).json({
      message: "User registered successfully",
      user: createdUser,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export default userregistration;
