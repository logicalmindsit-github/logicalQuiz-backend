import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../utils/email.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message:
          "User with this email already exists, Please Choose Different Email.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    console.log("User created successfully");
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).json({ message: "email or password not found" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email,role:user.role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "5h",
      }
    );
    console.log("User Logged in Successfully");
    res
      .status(200)
      .json({ message: "User logged in successfully", accessToken ,userName: user.username});
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  try {
    console.log("User logged out Successfully");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("error logging out ", error.message);
    res.status(500).json({ message: "server error " });
  }
};

export const forgetPasswordPage = (req, res) => {
  if (req.user) {
    return res.status(400).json({ message: "User already logged in" });
  }
  res.status(200).json({ message: "Forget Password Page" });
};

export const resetPasswordPage = (req, res) => {
  const { email, token } = req.params;
  res.status(200).json({ message: "Reset Password succes", email, token })
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    const user = await User.findOne({ email });
    if (
      !user ||
      user.resetToken !== token ||
      user.resetTokenExpiration < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

export const generateResetToken = () => {
  return Math.random().toString(36).slice(2);
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Forget password request received for email:", email);
    if (!email || !email.trim()) {
      console.error("Email is required");
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    console.log("User found:", user);
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ message: "User not found" });
    }
 
    if (user.resetToken && user.resetTokenExpiration > Date.now()) {
      return res.status(400).json({ message: "Password reset already requested. Check your email." });
    }

    const resetToken = generateResetToken();
    console.log("Generated reset token:", resetToken);

    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();
    console.log("Reset token saved for user:", user.email);

    await sendPasswordResetEmail(email, resetToken);
    console.log("Password reset email sent successfully");

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Server Error" });
  }
};