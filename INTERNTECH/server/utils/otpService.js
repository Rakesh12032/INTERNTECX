import db from "../db/database.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000;

export function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function saveOTP(email, otp) {
  await db.read();
  const filtered = db.data.otps.filter((item) => item.email !== email);
  filtered.push({
    id: `${email}-${Date.now()}`,
    email,
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    createdAt: new Date().toISOString()
  });
  db.data.otps = filtered;
  await db.write();
}

export async function verifyOTP(email, otp) {
  await db.read();
  const entry = db.data.otps.find((item) => item.email === email && item.otp === otp);

  if (!entry) {
    return false;
  }

  if (entry.expiresAt < Date.now()) {
    db.data.otps = db.data.otps.filter((item) => item.email !== email);
    await db.write();
    return false;
  }

  return true;
}

export async function deleteOTP(email) {
  await db.read();
  db.data.otps = db.data.otps.filter((item) => item.email !== email);
  await db.write();
}
