import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const STORAGE_KEY = "interntech_chat_history";

const quickReplies = [
  "Suggest Course",
  "Career Path",
  "Resume Tips",
  "Job Help",
  "Platform Help"
];

const knowledgeBase = [
  { keys: ["suggest course", "course"], reply: "Tell me your interest area like web, python, AI/ML, design, cloud, data science, cybersecurity, marketing, or Android and I will suggest the best course." },
  { keys: ["web"], reply: "Full Stack Web Development is the strongest all-rounder option if you want internships, projects, and entry-level product engineering roles." },
  { keys: ["python"], reply: "Python Programming is a great foundation. If you already know basics, Machine Learning with Python is a strong next step." },
  { keys: ["machine learning", "ml", "ai"], reply: "Machine Learning with Python fits students who enjoy data, models, and problem solving. Data Science and Analytics is also a good companion track." },
  { keys: ["design", "ui", "ux"], reply: "UI/UX Design Fundamentals is the best starting point if you enjoy product thinking, visual communication, and user experience work." },
  { keys: ["cloud"], reply: "Cloud Computing with AWS is useful if you want infrastructure, deployment, and platform engineering exposure." },
  { keys: ["dsa", "java"], reply: "DSA in Java is best if your target is coding rounds, placement prep, and software engineering interviews." },
  { keys: ["cybersecurity", "security"], reply: "Cybersecurity Fundamentals is a good starting point for students who like systems, defense, and security concepts." },
  { keys: ["sql", "database"], reply: "SQL and Database Design is a fast, practical course for analytics, backend, and data-focused roles." },
  { keys: ["marketing"], reply: "Digital Marketing for Tech is good if you like growth, communication, and product storytelling in tech companies." },
  { keys: ["android", "mobile"], reply: "Android App Development is the right path if you want to build mobile apps and work with app UI plus API integration." },
  { keys: ["career"], reply: "A strong career roadmap is: choose one core skill, complete one full course, build two to three projects, earn your certificate, polish resume and LinkedIn, then apply consistently." },
  { keys: ["roadmap"], reply: "Pick one domain, avoid switching every week, build proof through projects, and use internships plus quizzes plus certificates to create a clear story." },
  { keys: ["resume"], reply: "Keep your resume to one page, put projects above generic coursework, write outcome-focused bullets, and tailor the top section to the role." },
  { keys: ["linkedin"], reply: "Use a clear headline, strong About section, featured projects, and add your certificate verify link once you complete a course." },
  { keys: ["job"], reply: "Use the Jobs page to browse openings. Keep your dashboard profile updated and apply early to verified roles that match your skills." },
  { keys: ["interview"], reply: "For interviews, revise projects deeply, prepare role-specific basics, and practice explaining what problem your project solved and what tradeoffs you made." },
  { keys: ["certificate"], reply: "To get a certificate, enroll in a course, complete all lessons, pass the quiz with at least 70 percent, and then your certificate is generated." },
  { keys: ["verify"], reply: "You can verify any InternTech certificate from the Verify page using the certificate ID. Colleges can also use the College Verify portal." },
  { keys: ["verification letter"], reply: "A verification letter can be downloaded from the public Verify page after a certificate is validated successfully." },
  { keys: ["internship"], reply: "InternTech internship tracks include web dev, AI/ML, data science, cybersecurity, UI/UX, python, cloud and Android/iOS. Open the Internship page and apply for a track." },
  { keys: ["referral"], reply: "You earn Rs. 199 for each successful referral payment. Your referral code, history, and withdrawal progress are visible in Share and Earn." },
  { keys: ["wallet"], reply: "Wallet balance increases after successful referral payouts. Withdrawals unlock once your balance reaches Rs. 500." },
  { keys: ["withdraw"], reply: "You can request a withdrawal from the Share and Earn dashboard once your wallet balance is at least Rs. 500." },
  { keys: ["ambassador"], reply: "The Ambassador page lets you apply, track the leaderboard, and build your campus presence while helping students discover InternTech." },
  { keys: ["college"], reply: "Colleges can log in through College Verify, verify certificates one by one, and also run bulk verification with export options." },
  { keys: ["company"], reply: "Companies can register, get approved by admin, post jobs, and manage applicants from the Company Portal." },
  { keys: ["admin"], reply: "Admins manage courses, certificates, withdrawals, ambassadors, colleges, companies, verification logs, and internship applications from the Admin dashboard." },
  { keys: ["quiz"], reply: "Each quiz tests your understanding of the course. Passing with 70 percent or more helps unlock your certificate." },
  { keys: ["attempt"], reply: "Quizzes currently track attempts and scores. If the attempt limit is reached recently, the API can block immediate reattempts." },
  { keys: ["progress"], reply: "The dashboard Progress page shows lessons completed, hours learned, quiz trends, skill radar, time distribution, and earned badges." },
  { keys: ["dashboard"], reply: "The Dashboard gives you access to overview, progress analytics, referrals, certificates, and your job application history." },
  { keys: ["register"], reply: "Create your account on Register, verify with OTP, then log in and start learning from your dashboard." },
  { keys: ["otp"], reply: "OTP is sent during registration. If it expires, you can request resend from the verification modal." },
  { keys: ["forgot password", "reset password"], reply: "Use the Forgot Password option on Login to generate a reset token flow for your account." },
  { keys: ["home"], reply: "The Home page highlights courses, features, testimonials, ambassador opportunities, share and earn, and placement stats." },
  { keys: ["certificate id"], reply: "Every certificate gets a unique InternTech certificate ID which can be used on the Verify page or in the college portal." },
  { keys: ["placement"], reply: "InternTech is designed to help students move from learning to internships to verified credentials and then toward job applications." },
  { keys: ["project"], reply: "Projects matter because they prove execution. Use course modules as a base, then build one or two customized portfolio-ready implementations." },
  { keys: ["mentor"], reply: "Each seeded course includes mentor information so learners can understand the focus and style behind the program." },
  { keys: ["free"], reply: "Most seeded courses are free. Some advanced tracks like AWS are paid in the current data setup." },
  { keys: ["paid"], reply: "Paid tracks generally offer specialized value. In the current seed, AWS and internships are monetized while many core courses are free." },
  { keys: ["duration"], reply: "Course durations vary by track, usually from 4 to 12 weeks in the current setup." },
  { keys: ["student"], reply: "Students can register, verify with OTP, enroll in courses, complete lessons, take quizzes, earn certificates, apply for jobs, and use referrals." },
  { keys: ["help"], reply: "I can help with courses, internships, jobs, certificates, verification, referrals, dashboard usage, college portal, company portal, and career guidance." },
  { keys: ["platform"], reply: "InternTech combines learning, internships, certificates, jobs, referrals, ambassador growth, and verification into one student-focused platform." }
];

function getResponse(input, userName) {
  const text = input.toLowerCase().trim();

  for (const item of knowledgeBase) {
    if (item.keys.some((key) => text.includes(key))) {
      return item.reply;
    }
  }

  return `${userName ? `${userName}, ` : ""}need human help? WhatsApp us. I can also help with course suggestions, career paths, certificates, jobs, internships, referrals, dashboard usage, and portal guidance.`;
}

export default function NexAIChatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
  }, [messages]);

  const greeting = useMemo(
    () =>
      user?.name
        ? `Hi ${user.name.split(" ")[0]}, ask me anything about InternTech.`
        : "Hi, ask me anything about InternTech.",
    [user]
  );

  const sendMessage = (textToSend) => {
    const content = (textToSend || input).trim();
    if (!content) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setTyping(true);

    window.setTimeout(async () => {
      try {
        const response = await api.post("/chatbot/ask", {
          message: content,
          userName: user?.name || ""
        });
        setMessages([...nextMessages, { role: "assistant", content: response.data.reply }]);
      } catch (_error) {
        const reply = getResponse(content, user?.name?.split(" ")[0]);
        setMessages([...nextMessages, { role: "assistant", content: reply }]);
      } finally {
        setTyping(false);
      }
    }, 450);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue text-white shadow-2xl"
      >
        <Bot className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-40 right-6 z-50 flex h-[560px] w-[360px] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between bg-blue px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" />
                <div>
                  <p className="font-semibold">InternTech AI</p>
                  <p className="text-xs text-blue-100">Online</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setMessages([])} className="text-xs font-semibold text-white/90">
                  Clear
                </button>
                <button type="button" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-300">{greeting}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => sendMessage(reply)}
                    className="rounded-full bg-blue/10 px-3 py-2 text-xs font-semibold text-blue"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "bg-blue text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {typing ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm dark:bg-slate-800">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") sendMessage();
                  }}
                  placeholder="Ask about courses, jobs, certificates..."
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950"
                />
                <button type="button" onClick={() => sendMessage()} className="rounded-2xl bg-blue px-4 py-3 text-white">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
