import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { requireRole, verifyToken } from "../middleware/auth.js";
import { sendWithdrawalEmail } from "../utils/emailService.js";

const router = Router();

router.get("/history", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const history = db.data.walletHistory.filter((item) => item.userId === req.user.id);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch wallet history", error: error.message });
  }
});

router.post("/withdraw", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { accountName, bankName, accountNumber, ifsc, upiId, amount } = req.body;
    const numericAmount = Number(amount);
    db.read();

    const user = db.data.users.find((item) => item.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid withdrawal amount" });
    }

    if (numericAmount < 500) {
      return res.status(400).json({ message: "Minimum withdrawal amount is 500" });
    }

    if (numericAmount > (user.walletBalance || 0)) {
      return res.status(400).json({ message: "Withdrawal amount exceeds wallet balance" });
    }

    const hasBankDetails = accountName && bankName && accountNumber && ifsc;
    const hasUpi = Boolean(upiId);

    if (!hasBankDetails && !hasUpi) {
      return res.status(400).json({ message: "Provide either complete bank details or a UPI ID" });
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
    db.data.withdrawalRequests.push(request);
    db.data.walletHistory.push({
      id: uuidv4(),
      userId: user.id,
      type: "debit",
      amount: numericAmount,
      description: "Withdrawal request placed",
      timestamp: new Date().toISOString()
    });
    db.write();

    await sendWithdrawalEmail(user.email, user.name, numericAmount, "pending");

    return res.status(201).json({ message: "Withdrawal request created", request });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create withdrawal request", error: error.message });
  }
});

router.get("/withdrawals", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const requests = db.data.withdrawalRequests.filter((item) => item.studentId === req.user.id);
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch withdrawal requests", error: error.message });
  }
});

export default router;
