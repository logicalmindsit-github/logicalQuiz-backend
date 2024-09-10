import express from "express";
import User from "../models/userModel.js";
import {
  forgetPasswordPage,
  resetPasswordPage,
  signup,
  login,
  forgetPassword,
  resetPassword,
} from "../controller/authController.js";

const router = express.Router();

// this is public router
router.get("/", (req, res) => {
  res.send("Hello, from Backend!");
});

router.get("/forget-password", forgetPasswordPage);
router.get("/reset-password/:email/:token", resetPasswordPage);
router.post("/signup", signup);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

router.post("/logout", (req, res) => {
  try {
    console.log("User logged out Successfully");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// this is admin router
router.get("/admin", (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this resource" });
    }
    console.log("Admin accessed the admin panel");
    res.status(200).json({ message: "Welcome to the admin panel!" });
  } catch (error) {
    console.error("Error accessing admin panel:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({
        message:
          "You are not authorized to access this resource , Only admins can view users.",
      });
    }
    const users = await User.find({}, { email: 1, password: 1 });
    const adminWelcomeMsg = "Welcome, Admin! Here are the users:";
    res.status(200).json({ message: adminWelcomeMsg, users });
  } catch (error) {
    console.error("Error retrieving users:", error.message);
    res.status(500).json({ error: "Error retrieving users" });
  }
});

export default router;
