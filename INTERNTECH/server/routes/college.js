import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { stateModels } from "../models/stateModels.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const college = await stateModels.colleges.findOne({ email: email?.toLowerCase() }).lean();

    if (!college) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password || "", college.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: college.id, email: college.email, role: "college", name: college.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: college.id,
        name: college.name,
        email: college.email,
        role: "college",
        city: college.city,
        state: college.state
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "College login failed", error: error.message });
  }
});

export default router;
