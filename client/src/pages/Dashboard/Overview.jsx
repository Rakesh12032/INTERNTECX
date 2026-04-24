import React, { useEffect, useState } from "react";
import { Award, BookOpen, IndianRupee, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

function widthClass(value) {
  if (value >= 100) return "w-full";
  if (value >= 80) return "w-4/5";
  if (value >= 60) return "w-3/4";
  if (value >= 40) return "w-1/2";
  if (value >= 20) return "w-1/4";
  return "w-[12%]";
}

function greetingByTime() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Overview() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [coursesResponse, certificatesResponse, referralResponse] = await Promise.all([
          api.get("/courses/my"),
          api.get("/certificates/my"),
          api.get("/referral/my")
        ]);

        setCourses((coursesResponse.data.courses || []).slice(0, 3));
        setCertificates(certificatesResponse.data || []);
        setReferralData(referralResponse.data || null);
      } catch (_error) {
        setCourses([]);
        setCertificates([]);
        setReferralData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const completedCourses = courses.filter((course) => (course.enrollment?.progress || 0) === 100).length;

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-gradient-to-br from-navy via-blue to-cyan p-8 text-white">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan">{greetingByTime()}</p>
        <h1 className="mt-3 text-4xl font-bold">Welcome back, {user?.name || "Learner"}</h1>
        <p className="mt-4 max-w-2xl text-slate-100">
          Track your learning, certificates, referrals, and next opportunities from one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/courses" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-navy transition hover:-translate-y-0.5">
            Browse Courses
          </Link>
          <Link to="/internship" className="rounded-2xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Apply Internship
          </Link>
          <Link to="/dashboard/referral" className="rounded-2xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Share and Earn
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Enrolled Courses", courses.length || 0, BookOpen],
          ["Completed", completedCourses, Layers3],
          ["Certificates", certificates.length, Award],
          ["Wallet Balance", `Rs. ${user?.walletBalance || 0}`, IndianRupee]
        ].map(([label, value, Icon]) => (
          <div
            key={label}
            className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <Icon className="h-8 w-8 text-blue" />
            <p className="mt-4 text-3xl font-bold">{value}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Profile Snapshot</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Keep an eye on your learner identity, college profile, and earning momentum.
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue/10 text-2xl font-bold text-blue">
              {(user?.name || "L").slice(0, 1).toUpperCase()}
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">College</p>
              <p className="mt-2 font-semibold">{user?.college || "Add your college profile"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Referral Code</p>
              <p className="mt-2 font-mono font-semibold">{referralData?.referralCode || user?.referralCode || "-"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Ambassador Status</p>
              <p className="mt-2 font-semibold">{referralData?.ambassadorStatus === "approved" ? "Approved Ambassador" : "Not active yet"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pending Withdrawal</p>
              <p className="mt-2 font-semibold">Rs. {referralData?.pendingWithdrawal || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gold/30 bg-[linear-gradient(180deg,#fffdf6_0%,#f9f1d9_100%)] p-6 text-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Momentum Card</p>
          <h2 className="mt-3 text-2xl font-bold text-navy">Keep your streak alive</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Finish one more lesson, unlock another referral, or attempt your next quiz to keep moving toward certificates and payouts.
          </p>
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-sm font-semibold">Courses in progress</p>
              <p className="mt-2 text-2xl font-bold">{courses.length}</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-sm font-semibold">Certificates earned</p>
              <p className="mt-2 text-2xl font-bold">{certificates.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Courses</h2>
          <Link to="/courses" className="text-sm font-semibold text-blue">
            Browse More
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : courses.length ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {course.duration} | {course.level}
                </p>
                <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-3 rounded-full bg-blue ${widthClass(
                      course.enrollment?.progress || 0
                    )}`}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {course.enrollment?.completedLessons?.length || 0} lessons done |{" "}
                  {course.enrollment?.progress || 0}% complete
                </p>
                <Link
                  to={`/learn/${course.slug || course.id}`}
                  className="mt-4 inline-block text-sm font-semibold text-blue"
                >
                  Continue
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            You have not enrolled in any courses yet. Start with a free course and your progress
            will show up here.
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Certificates</h2>
          <Link to="/dashboard/certificates" className="text-sm font-semibold text-blue">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : certificates.length ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {certificates.slice(0, 2).map((certificate) => (
              <div
                key={certificate.certId}
                className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Certificate</p>
                <h3 className="mt-2 text-lg font-semibold">{certificate.courseName}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  ID: {certificate.certId}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Issued on {new Date(certificate.completionDate).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Complete a course and pass its assessment to unlock certificates here.
          </div>
        )}
      </section>
    </div>
  );
}
