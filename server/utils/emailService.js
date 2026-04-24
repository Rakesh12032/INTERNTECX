import nodemailer from "nodemailer";

const hasEmailConfig = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS && !process.env.EMAIL_USER.includes("your_"));

const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  : null;

async function sendMail({ to, subject, html }) {
  if (!transporter) {
    console.log(`Email skipped for ${to}: ${subject}`);
    return { skipped: true };
  }

  return transporter.sendMail({
    from: `"InternTech" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
}

export async function sendOTPEmail(email, otp, name) {
  return sendMail({
    to: email,
    subject: "Your InternTech OTP",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;padding:24px;background:#f8fafc;color:#0f172a">
        <h2 style="margin-bottom:12px;">Hi ${name},</h2>
        <p>Your InternTech verification code is:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#2563EB;margin:18px 0;">${otp}</div>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `
  });
}

export async function sendWelcomeEmail(email, name) {
  return sendMail({
    to: email,
    subject: "Welcome to InternTech",
    html: `<div style="font-family:Inter,Arial,sans-serif;padding:24px;"><h2>Welcome, ${name}!</h2><p>Your InternTech account is now active. Learn. Intern. Succeed.</p></div>`
  });
}

export async function sendCertificateEmail(email, name, courseName, certId) {
  return sendMail({
    to: email,
    subject: "Your InternTech Certificate",
    html: `<div style="font-family:Inter,Arial,sans-serif;padding:24px;"><h2>Congratulations ${name}</h2><p>Your certificate for <strong>${courseName}</strong> has been issued.</p><p>Certificate ID: <strong>${certId}</strong></p></div>`
  });
}

export async function sendWithdrawalEmail(email, name, amount, status) {
  return sendMail({
    to: email,
    subject: `Withdrawal ${status} - InternTech`,
    html: `<div style="font-family:Inter,Arial,sans-serif;padding:24px;"><h2>Hello ${name}</h2><p>Your withdrawal request of <strong>₹${amount}</strong> is currently <strong>${status}</strong>.</p></div>`
  });
}

export async function sendWeeklyReport(email, name, stats) {
  return sendMail({
    to: email,
    subject: "Your Weekly InternTech Progress Report",
    html: `<div style="font-family:Inter,Arial,sans-serif;padding:24px;"><h2>Weekly Report for ${name}</h2><p>Lessons completed: ${stats.lessonsCompleted || 0}</p><p>Quiz attempts: ${stats.quizAttempts || 0}</p><p>Certificates earned: ${stats.certificatesEarned || 0}</p></div>`
  });
}
