import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { stateModels } from "../models/stateModels.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/me", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const application = await stateModels.ambassadors.findOne({ studentId: req.user.id }).lean();
    return res.json(application || null);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch ambassador status", error: error.message });
  }
});

router.post("/apply", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { instagram, linkedin, reason, monthlyReferrals } = req.body;
    const existing = await stateModels.ambassadors.findOne({ studentId: req.user.id }).lean();
    if (existing) {
      return res.status(409).json({ message: "Ambassador application already exists" });
    }

    const user = await stateModels.users.findOne({ id: req.user.id }).lean();
    const application = {
      id: uuidv4(),
      studentId: req.user.id,
      name: user?.name,
      college: user?.college,
      city: user?.city,
      referralCount: user?.referralCount || 0,
      instagram,
      linkedin,
      reason,
      monthlyReferrals,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    await stateModels.ambassadors.create(application);
    return res.status(201).json({ message: "Ambassador application submitted", application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to apply as ambassador", error: error.message });
  }
});

router.get("/leaderboard", async (_req, res) => {
  try {
    const leaderboard = await stateModels.ambassadors
      .find({ status: "approved" })
      .sort({ referralCount: -1 })
      .limit(10)
      .lean();
    return res.json(leaderboard);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch ambassador leaderboard", error: error.message });
  }
});

export default router;
