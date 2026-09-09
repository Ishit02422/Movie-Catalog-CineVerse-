import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { ApiError } from "../middleware/errorHandler.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

// Helper to generate JWT Token
const generateToken = (id: string): string => {
  const secret =
    process.env.JWT_SECRET || "cineverse_super_secret_jwt_key_2024_secure";
  const expire = process.env.JWT_EXPIRE || "30d";
  return jwt.sign({ id }, secret, {
    expiresIn: expire as any,
  });
};

/**
 * @desc    Register a new user with Email
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError("Please provide name, email, and password.", 400);
    }

    if (password.length < 6) {
      throw new ApiError("Password must be at least 6 characters long.", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError("An account with this email already exists.", 400);
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      data: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user with Email & password
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError("Please provide both email and password.", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      throw new ApiError("Invalid email or password credentials.", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError("Invalid email or password credentials.", 401);
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      data: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if a user exists by Email or Phone
 * @route   POST /api/auth/check-user
 * @access  Public
 */
export const checkUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { identifier } = req.body;

    if (!identifier || String(identifier).trim().length === 0) {
      throw new ApiError("Please provide an email or phone number.", 400);
    }

    const raw = String(identifier).trim();
    const isNum = /^[0-9+ -]+$/.test(raw) && raw.replace(/\D/g, "").length >= 10;
    const cleanPhone = raw.replace(/\D/g, "");
    const cleanEmail = raw.toLowerCase();

    let user = null;
    if (isNum) {
      user = await User.findOne({ phone: cleanPhone });
    } else {
      user = await User.findOne({ email: cleanEmail });
    }

    if (user) {
      res.status(200).json({
        success: true,
        exists: true,
        data: {
          id: user._id,
          name: user.name,
          first_name: user.first_name,
          surname: user.surname,
          phone: user.phone,
          email: user.email,
        },
      });
    } else {
      res.status(200).json({
        success: true,
        exists: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

import { sendOtpEmail } from "../utils/emailService.js";
import { sendRealSms, verifyTwilioOtp } from "../utils/smsService.js";

/**
 * @desc    Send OTP (Supports both Email and Mobile Phone)
 * @route   POST /api/auth/phone/send-otp
 * @access  Public
 */
export const sendPhoneOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawInput = req.body.identifier || req.body.phone || req.body.email;

    if (!rawInput || String(rawInput).trim().length === 0) {
      throw new ApiError("Please provide a valid email or 10-digit mobile number.", 400);
    }

    const inputStr = String(rawInput).trim();
    const isNum = /^[0-9+ -]+$/.test(inputStr) && inputStr.replace(/\D/g, "").length >= 10;
    const isEmail = inputStr.includes("@") || (!isNum && inputStr.length >= 3);

    if (!isEmail && !isNum) {
      throw new ApiError("Please enter a valid email address or 10-digit phone number.", 400);
    }

    const cleanIdentifier = isEmail
      ? (inputStr.includes("@") ? inputStr.toLowerCase() : `${inputStr.toLowerCase()}@gmail.com`)
      : inputStr.replace(/\D/g, "");

    // Check if an unexpired OTP was already generated for this user
    const existingOtpDoc = await Otp.findOne({
      $or: [{ identifier: cleanIdentifier }, { phone: cleanIdentifier }, { email: cleanIdentifier }],
      expires_at: { $gt: new Date() },
    });

    // Use existing active OTP if still valid, or generate a fresh 6-digit OTP
    const generatedOtp = existingOtpDoc?.otp || Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = existingOtpDoc?.expires_at || new Date(Date.now() + 5 * 60 * 1000);

    const mode = req.body.mode; // "signin" | "register" | "signup" | undefined

    if (isEmail) {
      const cleanEmail = cleanIdentifier;
      const existingUser = await User.findOne({ email: cleanEmail });

      // Strict Mode Validation: Sign In requires existing user, Sign Up requires new user
      if (mode === "signin" && !existingUser) {
        throw new ApiError(
          "No account found with this email. Please switch to Sign Up to create a new account.",
          404
        );
      }
      if ((mode === "register" || mode === "signup") && existingUser) {
        throw new ApiError(
          "An account already exists with this email. Please switch to Sign In.",
          400
        );
      }

      // Save/Refresh OTP in database
      await Otp.deleteMany({ $or: [{ identifier: cleanEmail }, { email: cleanEmail }] });
      await Otp.create({
        identifier: cleanEmail,
        email: cleanEmail,
        otp: generatedOtp,
        expires_at: expiresAt,
      });

      console.log(`📧 [Email OTP] Verified/Sent code ${generatedOtp} to ${cleanEmail}`);

      // Dispatch real email via Nodemailer asynchronously in background (instant 50ms HTTP response)
      sendOtpEmail({
        toEmail: cleanEmail,
        otp: generatedOtp,
        userName: existingUser?.first_name || existingUser?.name || "Movie Lover",
      }).catch((err) => console.error("Background email dispatch error:", err));

      res.status(200).json({
        success: true,
        type: "email",
        exists: !!existingUser,
        isNewUser: !existingUser,
        user_name: existingUser?.first_name || existingUser?.name || null,
        message: `Verification code sent to ${cleanEmail}! Please check your Inbox.`,
        identifier: cleanEmail,
        email: cleanEmail,
        dev_otp: generatedOtp,
      });
      return;
    }

    // Is Phone
    const cleanPhone = cleanIdentifier;
    const existingUser = await User.findOne({ phone: cleanPhone });

    // Strict Mode Validation for Phone
    if (mode === "signin" && !existingUser) {
      throw new ApiError(
        "No account found with this mobile number. Please switch to Sign Up to create a new account.",
        404
      );
    }
    if ((mode === "register" || mode === "signup") && existingUser) {
      throw new ApiError(
        "An account already exists with this mobile number. Please switch to Sign In.",
        400
      );
    }

    // Save/Refresh OTP in database
    await Otp.deleteMany({ $or: [{ identifier: cleanPhone }, { phone: cleanPhone }] });
    await Otp.create({
      identifier: cleanPhone,
      phone: cleanPhone,
      otp: generatedOtp,
      expires_at: expiresAt,
    });

    console.log(`📱 [SMS Gateway] OTP sent to +91-${cleanPhone}: Your CineVerse verification code is ${generatedOtp}`);

    // Dispatch live SMS via Twilio & Fast2SMS
    const smsResult = await sendRealSms(cleanPhone, generatedOtp);

    res.status(200).json({
      success: true,
      type: "phone",
      exists: !!existingUser,
      isNewUser: !existingUser,
      user_name: existingUser?.first_name || existingUser?.name || null,
      message: `OTP sent via SMS to +91-${cleanPhone}!`,
      identifier: cleanPhone,
      phone: cleanPhone,
      dev_otp: generatedOtp,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP (Supports both Email and Mobile Phone) & Login/Register
 * @route   POST /api/auth/phone/verify-otp
 * @access  Public
 */
export const verifyPhoneOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { identifier, phone, email, otp, name, first_name, surname, gender } = req.body;
    const rawInput = identifier || phone || email;

    if (!rawInput || !otp) {
      throw new ApiError("Please provide both email/phone and 6-digit OTP code.", 400);
    }

    const inputStr = String(rawInput).trim();
    const cleanOtp = String(otp).trim();
    const isEmail = inputStr.includes("@");
    const cleanIdentifier = isEmail ? inputStr.toLowerCase() : inputStr.replace(/\D/g, "");

    // 1. Verify in MongoDB
    const validOtpDoc = await Otp.findOne({
      $or: [
        { identifier: cleanIdentifier },
        { phone: cleanIdentifier },
        { email: cleanIdentifier },
      ],
      otp: cleanOtp,
      expires_at: { $gt: new Date() },
    });

    // 2. Or verify with Twilio
    const isTwilioValid = !isEmail && !validOtpDoc ? await verifyTwilioOtp(cleanIdentifier, cleanOtp) : false;

    if (!validOtpDoc && !isTwilioValid) {
      throw new ApiError("Invalid or expired OTP code. Please enter the valid 6-digit code.", 400);
    }

    // OTP is valid - delete it so it cannot be reused
    await Otp.deleteMany({
      $or: [
        { identifier: cleanIdentifier },
        { phone: cleanIdentifier },
        { email: cleanIdentifier },
      ],
    });

    // Check if user already exists
    let user = isEmail
      ? await User.findOne({ email: cleanIdentifier })
      : await User.findOne({ phone: cleanIdentifier });

    const computedName = (first_name && surname)
      ? `${first_name.trim()} ${surname.trim()}`
      : (first_name || name || (isEmail ? cleanIdentifier.split("@")[0] : `Member ${cleanIdentifier.slice(-4)}`));

    if (!user) {
      // Create new user
      user = await User.create({
        name: computedName,
        first_name: first_name?.trim() || (isEmail ? cleanIdentifier.split("@")[0] : `Member`),
        surname: surname?.trim() || "",
        gender: gender || "Male",
        phone: isEmail ? undefined : cleanIdentifier,
        email: isEmail ? cleanIdentifier : undefined,
        role: "user",
      });
    } else {
      // Update existing user details if new values given
      if (first_name) user.first_name = first_name.trim();
      if (surname) user.surname = surname.trim();
      if (gender) user.gender = gender;
      if (first_name || surname) {
        user.name = computedName;
      }
      await user.save();
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: "Verified successfully!",
      token,
      data: {
        id: user.id || user._id,
        name: user.name,
        first_name: user.first_name,
        surname: user.surname,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    One-click Google Sign In / Sign Up
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, photo_url } = req.body;

    if (!email) {
      throw new ApiError("Google email is required.", 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      const nameParts = (name || "").trim().split(" ");
      const firstName = nameParts[0] || cleanEmail.split("@")[0];
      const surname = nameParts.slice(1).join(" ") || "";

      user = await User.create({
        name: name || cleanEmail.split("@")[0],
        first_name: firstName,
        surname: surname,
        email: cleanEmail,
        avatar: photo_url || undefined,
        role: "user",
      });
    } else {
      // Update avatar if provided and not yet set
      if (photo_url && !user.avatar) {
        user.avatar = photo_url;
        await user.save();
      }
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: "Google sign in successful!",
      token,
      data: {
        id: user.id || user._id,
        name: user.name,
        first_name: user.first_name,
        surname: user.surname,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected)
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError("Not authorized", 401);
    }

    res.status(200).json({
      success: true,
      data: {
        id: req.user.id || req.user._id,
        name: req.user.name,
        first_name: req.user.first_name,
        surname: req.user.surname,
        gender: req.user.gender,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        created_at: req.user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current logged in user profile
 * @route   PUT /api/auth/profile
 * @access  Private (Protected)
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError("Not authorized", 401);
    }

    const { first_name, surname, gender, name, phone, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (first_name !== undefined) user.first_name = first_name.trim();
    if (surname !== undefined) user.surname = surname.trim();
    if (gender !== undefined) user.gender = gender;

    // Recalculate full name if first_name/surname provided, or use name if passed
    if (first_name || surname) {
      user.name = `${user.first_name || ""} ${user.surname || ""}`.trim() || user.name;
    } else if (name) {
      user.name = name.trim();
    }

    if (phone) {
      const cleanPhone = String(phone).trim().replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        throw new ApiError("Please provide a valid 10-digit mobile number.", 400);
      }
      // Check if another user has this phone
      const phoneConflict = await User.findOne({
        phone: cleanPhone,
        _id: { $ne: user._id },
      });
      if (phoneConflict) {
        throw new ApiError("This mobile number is already in use by another account.", 400);
      }
      user.phone = cleanPhone;
    }

    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      const emailConflict = await User.findOne({
        email: cleanEmail,
        _id: { $ne: user._id },
      });
      if (emailConflict) {
        throw new ApiError("This email is already in use by another account.", 400);
      }
      user.email = cleanEmail;
    }

    await user.save();

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      token,
      data: {
        id: user.id || user._id,
        name: user.name,
        first_name: user.first_name,
        surname: user.surname,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete current logged in user account
 * @route   DELETE /api/auth/profile
 * @access  Private (Protected)
 */
export const deleteProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError("Not authorized", 401);
    }

    const userId = req.user._id;
    const userPhone = req.user.phone;

    await User.findByIdAndDelete(userId);

    // Clean up any remaining OTPs
    if (userPhone) {
      await Otp.deleteMany({ phone: userPhone });
    }

    res.status(200).json({
      success: true,
      message: "Account permanently deleted.",
    });
  } catch (error) {
    next(error);
  }
};

