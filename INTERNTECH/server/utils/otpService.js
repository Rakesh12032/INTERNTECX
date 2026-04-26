import { stateModels } from "../models/stateModels.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000;

export function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function saveOTP(email, otp) {
  await stateModels.otps.deleteMany({ email });
  await stateModels.otps.create({
    id: `${email}-${Date.now()}`,
    email,
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    createdAt: new Date().toISOString()
  });
}

export async function verifyOTP(email, otp) {
  const entry = await stateModels.otps.findOne({ email, otp }).lean();

  if (!entry) {
    return false;
  }

  if (entry.expiresAt < Date.now()) {
    await stateModels.otps.deleteMany({ email });
    return false;
  }

  return true;
}

export async function deleteOTP(email) {
  await stateModels.otps.deleteMany({ email });
}
