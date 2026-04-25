import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { stateModels } from "../models/stateModels.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const user = await stateModels.users.findOne({ id: req.user.id }).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const referralList = await stateModels.referralTransactions.find({ referrerId: req.user.id }).lean();

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

    if (!paymentConfirmed) {
      return res.status(400).json({ message: "Payment not confirmed" });
    }

    const newStudent = await stateModels.users.findOne({ id: newStudentId }).lean();
    const referrer = await stateModels.users.findOne({ referralCode: referralCode });

    if (!newStudent || !referrer) {
      return res.status(404).json({ message: "Student or referrer not found" });
    }

    if (newStudent.id === referrer.id) {
      return res.status(400).json({ message: "Self-referral is not allowed" });
    }

    const existing = await stateModels.referralTransactions.findOne({
      referrerId: referrer.id,
      referredStudentId: newStudent.id,
      status: "completed"
    }).lean();

    if (existing) {
      return res.status(409).json({ message: "Referral reward already processed" });
    }

    referrer.walletBalance = (referrer.walletBalance || 0) + 199;
    referrer.totalEarned = (referrer.totalEarned || 0) + 199;
    referrer.referralCount = (referrer.referralCount || 0) + 1;
    await referrer.save();

    await stateModels.walletHistory.create({
      id: uuidv4(),
      userId: referrer.id,
      type: "credit",
      amount: 199,
      description: `Referral: ${newStudent.name}`,
      timestamp: new Date().toISOString()
    });

    await stateModels.referralTransactions.create({
      id: uuidv4(),
      referrerId: referrer.id,
      referredStudentId: newStudent.id,
      referredStudentName: newStudent.name,
      amount: 199,
      status: "completed",
      timestamp: new Date().toISOString()
    });
    return res.json({ message: "Referral reward processed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to process referral reward", error: error.message });
  }
});

export default router;
