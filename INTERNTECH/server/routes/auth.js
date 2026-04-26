import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { stateModels } from "../models/stateModels.js";
import { verifyToken } from "../middleware/auth.js";
import { sendOTPEmail, sendWelcomeEmail } from "../utils/emailService.js";
import { generateReferralCode, generateUserId } from "../utils/generators.js";
import { deleteOTP, generateOTP, saveOTP, verifyOTP } from "../utils/otpService.js";
import { Router } from "express";

const router = Router();

const registerValidators = [
  body("name").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").matches(/^[0-9]{10}$/).withMessage("Phone must be 10 digits"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("college").trim().notEmpty().withMessage("College is required"),
  body("degree").trim().notEmpty().withMessage("Degree is required"),
  body("branch").trim().notEmpty().withMessage("Branch is required"),
  body("year").trim().notEmpty().withMessage("Year is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("state").trim().notEmpty().withMessage("State is required")
];

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function sanitizeUser(user) {
  const userObj = user.toObject ? user.toObject() : user;
  const { password, resetToken, resetTokenExpiry, _id, __v, ...safeUser } = userObj;
  return {
    ...safeUser,
    name: safeUser.name || safeUser.companyName || safeUser.institutionName || "Interntex User"
  };
}

router.post("/register", registerValidators, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { name, email, phone, password, college, degree, branch, year, city, state, referralCode } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await stateModels.users.findOne({ email: normalizedEmail }).lean();

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const referredByUser = referralCode
      ? await stateModels.users.findOne({ referralCode: referralCode.trim() }).lean()
      : null;

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      id: generateUserId(),
      name: name.trim(),
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role: "student",
      college: college.trim(),
      degree,
      branch: branch.trim(),
      year,
      city: city.trim(),
      state: state.trim(),
      referralCode: generateReferralCode(name),
      referredBy: referredByUser?.id || null,
      referralCount: 0,
      walletBalance: 0,
      totalEarned: 0,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    await stateModels.users.create(newUser);

    const otp = generateOTP();
    await saveOTP(normalizedEmail, otp);
    await sendOTPEmail(normalizedEmail, otp, newUser.name);

    return res.status(201).json({ message: "OTP sent to email", email: normalizedEmail });
  } catch (error) {
    return res.status(500).json({ message: "Unable to register user", error: error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await stateModels.users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!(await verifyOTP(normalizedEmail, otp))) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.status = "active";

    if (user.referredBy) {
      await stateModels.users.updateOne(
        { id: user.referredBy },
        { $inc: { referralCount: 1 } }
      );
    }

    await user.save();
    await deleteOTP(normalizedEmail);
    await sendWelcomeEmail(user.email, user.name);

    const token = createToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    const user = await stateModels.users.findOne({ email: normalizedEmail }).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password || "", user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Your account is not active yet" });
    }

    const token = createToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await stateModels.users.findOne({ email: normalizedEmail }).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await deleteOTP(normalizedEmail);
    const otp = generateOTP();
    await saveOTP(normalizedEmail, otp);
    await sendOTPEmail(normalizedEmail, otp, user.name);

    return res.json({ message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to resend OTP", error: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await stateModels.users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({ message: "If the account exists, a reset link has been prepared" });
    }

    user.resetToken = uuidv4();
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    return res.json({
      message: "Password reset link generated",
      resetToken: user.resetToken
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create reset token", error: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Valid token and password are required" });
    }

    const user = await stateModels.users.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Password reset failed", error: error.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    let user = await stateModels.users.findOne({ id: req.user.id }).lean();
    if (!user) user = await stateModels.colleges.findOne({ id: req.user.id }).lean();
    if (!user) user = await stateModels.companies.findOne({ id: req.user.id }).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch profile", error: error.message });
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const user = await stateModels.users.findOne({ id: req.user.id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedFields = ["name", "phone", "college", "city", "state", "profilePhoto"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
      }
    });

    await user.save();
    return res.json({ message: "Profile updated", user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update profile", error: error.message });
  }
});

export default router;
