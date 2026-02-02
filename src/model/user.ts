import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Secret, SignOptions } from "jsonwebtoken";

// Extend mongoose Document for strong typing
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
   hostedEvents?: mongoose.Schema.Types.ObjectId[];
  refreshToken?: string;

  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

     hostedEvents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Event" }
    ],

    // Tickets purchased by user
    
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Check password
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Generate access token
interface JwtPayload {
  _id: string;
}

userSchema.methods.generateAccessToken = function (): string {
  const payload: JwtPayload = { _id: this._id.toString() };

  const secret = process.env.ACCESS_TOKEN_SECRET as Secret;
  console.log("SECRET:", process.env.ACCESS_TOKEN_SECRET);
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRY as string; // must be string | number

  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

userSchema.methods.generateRefreshToken = function (): string {
  const payload: JwtPayload = { _id: this._id.toString() };

  const secret = process.env.REFRESH_TOKEN_SECRET as Secret;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRY as string;

  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
