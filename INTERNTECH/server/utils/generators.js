import { v4 as uuidv4 } from "uuid";

export function generateReferralCode(name) {
  const normalized = (name || "user").replace(/[^a-zA-Z]/g, "").toUpperCase().padEnd(4, "X").slice(0, 4);
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `INT-${normalized}${suffix}`;
}

export function generateCertificateId() {
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `INT-${year}-${suffix}`;
}

export function generateUserId() {
  return uuidv4().split("-")[0];
}
