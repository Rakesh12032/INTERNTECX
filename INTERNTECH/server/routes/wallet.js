import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { stateModels } from "../models/stateModels.js";
import { requireRole, verifyToken } from "../middleware/auth.js";
import { sendWithdrawalEmail } from "../utils/emailService.js";

const router = Router();

router.get("/history", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const history = await stateModels.walletHistory.find({ userId: req.user.id }).lean();
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch wallet history", error: error.message });
  }
});

router.post("/withdraw", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { accountName, bankName, accountNumber, ifsc, upiId, amount } = req.body;
    const numericAmount = Number(amount);
    const user = await stateModels.users.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (numericAmount < 500) {
      return res.status(400).json({ message: "Minimum withdrawal amount is 500" });
    }

    if (numericAmount > (user.walletBalance || 0)) {
      return res.status(400).json({ message: "Withdrawal amount exceeds wallet balance" });
    }

    const request = {
      id: uuidv4(),
      studentId: user.id,
      studentName: user.name,
      amount: numericAmount,
      accountName,
      bankName,
      accountNumber,
      ifsc,
      upiId,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    user.walletBalance = (user.walletBalance || 0) - numericAmount;
    await user.save();

    await stateModels.withdrawalRequests.create(request);
    await stateModels.walletHistory.create({
      id: uuidv4(),
      userId: user.id,
      type: "debit",
      amount: numericAmount,
      description: "Withdrawal request placed",
      timestamp: new Date().toISOString()
    });

    await sendWithdrawalEmail(user.email, user.name, numericAmount, "pending");

    return res.status(201).json({ message: "Withdrawal request created", request });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create withdrawal request", error: error.message });
  }
});

router.get("/withdrawals", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const requests = await stateModels.withdrawalRequests.find({ studentId: req.user.id }).lean();
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch withdrawal requests", error: error.message });
  }
});

export default router;
