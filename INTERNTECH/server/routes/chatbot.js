import { Router } from "express";
import db from "../db/database.js";

const router = Router();

const responses = [
  { keys: ["suggest course", "course"], reply: "Tell us your interest area like web, python, AI/ML, design, cloud, data science, cybersecurity, or Android and InternTech AI will suggest the best path." },
  { keys: ["web"], reply: "Full Stack Web Development is the strongest all-rounder option for internships, projects, and entry-level developer roles." },
  { keys: ["python"], reply: "Python Programming is ideal for beginners. If you already know basics, Machine Learning with Python is a great next step." },
  { keys: ["machine learning", "ml", "ai"], reply: "Machine Learning with Python is the best fit if you enjoy data, models, and practical experimentation." },
  { keys: ["data science", "analytics"], reply: "Data Science and Analytics works well if you want dashboards, insights, reporting, and data-driven problem solving." },
  { keys: ["design", "ui", "ux"], reply: "UI/UX Design Fundamentals is a great starting point for product design, user flows, and interface thinking." },
  { keys: ["cloud"], reply: "Cloud Computing with AWS is useful if you want to work with deployment, infrastructure, and platform systems." },
  { keys: ["cybersecurity", "security"], reply: "Cybersecurity Fundamentals is best for students who are curious about defense, systems, and risk awareness." },
  { keys: ["android", "mobile"], reply: "Android App Development is a strong path if you want to build mobile apps and learn real-world app workflows." },
  { keys: ["sql", "database"], reply: "SQL and Database Design is practical and fast to learn, especially for backend, analytics, and data roles." },
  { keys: ["marketing"], reply: "Digital Marketing for Tech is good if you enjoy growth, campaigns, and product communication in tech." },
  { keys: ["certificate"], reply: "To earn a certificate, enroll in a course, complete all lessons, pass the quiz, and then your certificate will be generated." },
  { keys: ["verify"], reply: "You can verify any InternTech certificate from the Verify page using the certificate ID. Colleges can use the College Verify portal too." },
  { keys: ["verification letter"], reply: "A verification letter can be downloaded after a certificate is successfully verified on the Verify page." },
  { keys: ["internship"], reply: "InternTech internship tracks include web dev, AI/ML, data science, cybersecurity, UI/UX, python, cloud, and Android/iOS." },
  { keys: ["job"], reply: "Use the Jobs page to explore openings, apply directly, and track status from My Jobs inside the dashboard." },
  { keys: ["resume"], reply: "Keep your resume to one page, highlight projects, use measurable outcomes, and tailor the top section to the role." },
  { keys: ["linkedin"], reply: "Use a clear headline, strong About section, featured projects, and add certificate verification links when possible." },
  { keys: ["career"], reply: "A strong roadmap is: pick one skill area, finish one complete course, build projects, earn a certificate, polish your resume, then apply consistently." },
  { keys: ["roadmap"], reply: "Consistency matters most. Finish one track deeply before jumping into a new domain." },
  { keys: ["referral"], reply: "You earn Rs. 199 per successful referral payment. Share your referral code from the Share and Earn dashboard." },
  { keys: ["wallet"], reply: "Your wallet balance grows from successful referral rewards. Withdrawals unlock after reaching the minimum threshold." },
  { keys: ["withdraw"], reply: "You can request a withdrawal once your wallet balance reaches Rs. 500 in the Share and Earn dashboard." },
  { keys: ["ambassador"], reply: "The Ambassador page lets you apply, track status, view leaderboard rankings, and build campus presence." },
  { keys: ["college"], reply: "Colleges can log in to verify certificates individually or in bulk and export verification reports." },
  { keys: ["company"], reply: "Companies can register, get approved, post jobs, and manage applicants from the Company Portal." },
  { keys: ["admin"], reply: "Admins manage students, courses, certificates, withdrawals, ambassadors, colleges, companies, and internship applications." },
  { keys: ["quiz"], reply: "Each course quiz checks understanding. A score of 70 percent or more currently qualifies as passing." },
  { keys: ["attempt"], reply: "Quiz attempts are tracked per student and course. If the limit is reached too recently, reattempt may be blocked." },
  { keys: ["dashboard"], reply: "The Dashboard includes overview, progress analytics, referrals, certificates, and job application history." },
  { keys: ["progress"], reply: "The Progress page shows lesson totals, hours learned, quiz trend, skill radar, time distribution, and badges." },
  { keys: ["otp"], reply: "During registration, OTP is sent to your email. If it expires, you can resend it from the verification modal." },
  { keys: ["forgot password", "reset password"], reply: "Use the Forgot Password option on Login to start the password reset flow." },
  { keys: ["free"], reply: "Many seeded courses are free in the current InternTech build. Some advanced tracks and internships are paid." },
  { keys: ["paid"], reply: "Paid tracks in the current seed focus on specialized value such as cloud training and internship participation." },
  { keys: ["mentor"], reply: "Seeded courses include mentor information so students can understand the teaching context for each track." },
  { keys: ["placement"], reply: "InternTech is designed to move students from learning to internships to verified certificates and finally toward jobs." },
  { keys: ["project"], reply: "Projects are one of the strongest signals in your profile. Use course lessons as a foundation, then customize your own build." },
  { keys: ["student"], reply: "Students can register, verify, enroll, complete lessons, take quizzes, earn certificates, apply for internships, and use referrals." },
  { keys: ["help"], reply: "I can help with courses, jobs, internships, certificates, referrals, dashboard usage, college verification, company portal, and career paths." },
  { keys: ["platform"], reply: "InternTech combines learning, internships, certificates, jobs, referrals, ambassador growth, and verification into one student-focused platform." }
];

function getReply(question) {
  const text = String(question || "").toLowerCase();
  for (const item of responses) {
    if (item.keys.some((key) => text.includes(key))) {
      return item.reply;
    }
  }
  return "Need human help? WhatsApp us. I can also help with courses, internships, jobs, certificates, dashboard guidance, referrals, and portal help.";
}

router.post("/ask", (req, res) => {
  try {
    const { message, userName } = req.body;
    const reply = getReply(message);

    db.read();
    db.data.chatLogs.push({
      id: `chat-${Date.now()}`,
      role: "user",
      message,
      reply,
      userName: userName || null,
      createdAt: new Date().toISOString()
    });
    db.write();

    return res.json({ reply });
  } catch (error) {
    return res.status(500).json({ message: "Failed to process chatbot message", error: error.message });
  }
});

export default router;
