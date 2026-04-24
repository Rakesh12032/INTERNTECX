import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/me", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const application = db.data.ambassadors.find((item) => item.studentId === req.user.id);
    return res.json(application || null);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch ambassador status", error: error.message });
  }
});

router.post("/apply", verifyToken, requireRole("student"), (req, res) => {
  try {
    const { instagram, linkedin, reason, monthlyReferrals } = req.body;
    db.read();

    const existing = db.data.ambassadors.find((item) => item.studentId === req.user.id);
    if (existing) {
      return res.status(409).json({ message: "Ambassador application already exists" });
    }

    const user = db.data.users.find((item) => item.id === req.user.id);
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

    db.data.ambassadors.push(application);
    db.write();
    return res.status(201).json({ message: "Ambassador application submitted", application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to apply as ambassador", error: error.message });
  }
});

router.get("/leaderboard", (_req, res) => {
  try {
    db.read();
    const leaderboard = db.data.ambassadors
      .filter((item) => item.status === "approved")
      .sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0))
      .slice(0, 10);
    return res.json(leaderboard);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch ambassador leaderboard", error: error.message });
  }
});

export default router;
