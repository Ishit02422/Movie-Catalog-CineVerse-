import { Router } from "express";
import {
  register,
  login,
  checkUser,
  sendPhoneOtp,
  verifyPhoneOtp,
  googleAuth,
  getMe,
  updateProfile,
  deleteProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// User Existence Check
router.post("/check-user", checkUser);

// Email Auth
router.post("/register", register);
router.post("/login", login);

// Phone OTP Auth
router.post("/phone/send-otp", sendPhoneOtp);
router.post("/phone/verify-otp", verifyPhoneOtp);

// Google Auth
router.post("/google", googleAuth);

// Protected Profile Management
router.get("/me", protect as any, getMe as any);
router.put("/profile", protect as any, updateProfile as any);
router.delete("/profile", protect as any, deleteProfile as any);

export default router;

