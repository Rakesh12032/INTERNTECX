import React, { useEffect, useState } from "react";
import { Crown, Gift, Megaphone, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const benefits = [
  ["Campus leadership", Megaphone, "Represent InternTech in your college and build visible credibility."],
  ["Referral earnings", Gift, "Grow your wallet by helping students discover valuable learning paths."],
  ["Verified recognition", ShieldCheck, "Stand out through leaderboard visibility and ambassador status."],
  ["Network growth", Users, "Connect with peers, students, and opportunity-seeking communities."],
  ["Personal branding", Sparkles, "Showcase your influence, consistency, and communication skills."],
  ["Early access", Crown, "Get closer visibility into platform campaigns and growth initiatives."]
];

export default function Ambassador() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStatus, setMyStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const loadData = async () => {
    try {
      const leaderboardResponse = await api.get("/ambassador/leaderboard");
      setLeaderboard(leaderboardResponse.data || []);
    } catch (_error) {
      setLeaderboard([]);
    }

    if (isAuthenticated && user?.role === "student") {
      try {
        const statusResponse = await api.get("/ambassador/me");
        setMyStatus(statusResponse.data);
      } catch (_error) {
        setMyStatus(null);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated, user]);

  const onSubmit = async (values) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/ambassador" } });
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/ambassador/apply", values);
      toast.success("Ambassador application submitted");
      reset();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Application failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-[36px] bg-gradient-to-br from-navy via-blue to-cyan p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan">Campus Ambassador Program</p>
        <h1 className="mt-4 text-5xl font-bold">Lead your campus. Grow your network. Earn rewards.</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-100">
          Represent InternTech, help students discover quality opportunities, and build your personal brand while earning recognition.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {benefits.map(([title, Icon, description]) => (
          <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue/10 text-blue">
              <Icon className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-bold">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue">How it works</p>
          <div className="mt-6 grid gap-4">
            {[
              ["Apply with your student profile and social links."],
              ["Get reviewed by InternTech admin."],
              ["Share the platform, grow referrals, and build your presence."]
            ].map((step, index) => (
              <div key={index} className="rounded-2xl bg-slate-50 px-5 py-4 dark:bg-slate-950">
                <span className="font-semibold text-blue">Step {index + 1}</span>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          {!myStatus ? (
            <>
              <h2 className="text-3xl font-bold">Apply Now</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                If approved, you will join the ambassador leaderboard and help your campus access InternTech courses and internships.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5">
                <input {...register("instagram")} placeholder="Instagram profile URL" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950" />
                <input {...register("linkedin")} placeholder="LinkedIn profile URL" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950" />
                <input {...register("monthlyReferrals")} placeholder="Expected monthly referrals" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950" />
                <textarea {...register("reason")} rows="5" placeholder="Why do you want to become an InternTech ambassador?" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950" />
                <button type="submit" disabled={submitting} className="rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-70">
                  {submitting ? "Submitting..." : `Apply as ${user?.name?.split(" ")[0] || "Ambassador"}`}
                </button>
              </form>
            </>
          ) : myStatus.status === "pending" ? (
            <div className="rounded-3xl border border-gold bg-gold/10 p-6">
              <h2 className="text-3xl font-bold text-gold">Application under review</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Your ambassador application is currently pending review. We will update your status after admin review.
              </p>
            </div>
          ) : myStatus.status === "approved" ? (
            <div className="rounded-3xl border border-success bg-success/10 p-6">
              <h2 className="text-3xl font-bold text-success">You are an approved ambassador</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Keep sharing InternTech on campus and help more students discover courses, internships, and career opportunities.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/70 p-4 dark:bg-slate-900/40">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Referrals</p>
                  <p className="mt-2 text-2xl font-bold">{myStatus.referralCount || 0}</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-4 dark:bg-slate-900/40">
                  <p className="text-sm text-slate-500 dark:text-slate-400">College</p>
                  <p className="mt-2 text-lg font-bold">{myStatus.college}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-danger bg-danger/10 p-6">
              <h2 className="text-3xl font-bold text-danger">Application not approved</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Your application was not approved in its current form. You can improve your profile and reapply later.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-3xl font-bold">Leaderboard</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {leaderboard.length ? (
            leaderboard.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-950">
                <div>
                  <p className="font-semibold">
                    {index === 0 ? "Crown " : ""}{index + 1}. {item.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.college} | {item.city}
                  </p>
                </div>
                <p className="text-lg font-bold text-blue">{item.referralCount || 0}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No approved ambassadors yet. Be the first to apply.</p>
          )}
        </div>
      </section>
    </div>
  );
}
