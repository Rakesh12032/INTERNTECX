import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    await db.read();
    const user = db.data.users.find((item) => item.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const referralList = db.data.referralTransactions.filter((item) => item.referrerId === req.user.id);

    return res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      referralList,
      walletBalance: user.walletBalance || 0,
      totalEarned: user.totalEarned || 0
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch referral data", error: error.message });
  }
});

router.post("/process-payment", async (req, res) => {
  try {
    const { newStudentId, referralCode, paymentConfirmed = true } = req.body;
    await db.read();

    if (!paymentConfirmed) {
      return res.status(400).json({ message: "Payment not confirmed" });
    }

    const newStudent = db.data.users.find((item) => item.id === newStudentId);
    const referrer = db.data.users.find((item) => item.referralCode === referralCode);

    if (!newStudent || !referrer) {
      return res.status(404).json({ message: "Student or referrer not found" });
    }

    if (newStudent.id === referrer.id) {
      return res.status(400).json({ message: "Self-referral is not allowed" });
    }

    const existing = db.data.referralTransactions.find(
      (item) => item.referrerId === referrer.id && item.referredStudentId === newStudent.id && item.status === "completed"
    );

    if (existing) {
      return res.status(409).json({ message: "Referral reward already processed" });
    }

    referrer.walletBalance = (referrer.walletBalance || 0) + 199;
    referrer.totalEarned = (referrer.totalEarned || 0) + 199;
    referrer.referralCount = (referrer.referralCount || 0) + 1;

    db.data.walletHistory.push({
      id: uuidv4(),
      userId: referrer.id,
      type: "credit",
      amount: 199,
      description: `Referral: ${newStudent.name}`,
      timestamp: new Date().toISOString()
    });

    db.data.referralTransactions.push({
      id: uuidv4(),
      referrerId: referrer.id,
      referredStudentId: newStudent.id,
      referredStudentName: newStudent.name,
      amount: 199,
      status: "completed",
      timestamp: new Date().toISOString()
    });

    await db.write();
    return res.json({ message: "Referral reward processed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to process referral reward", error: error.message });
  }
});

export default router;
