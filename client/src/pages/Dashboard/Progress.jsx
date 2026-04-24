import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../../utils/api";

function heatColor(count) {
  if (count >= 4) return "bg-blue";
  if (count >= 2) return "bg-cyan";
  if (count >= 1) return "bg-gold/80";
  return "bg-slate-200 dark:bg-slate-800";
}

export default function Progress() {
  const [data, setData] = useState(null);
  const [goalHours, setGoalHours] = useState(8);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await api.get("/analytics/student");
        setData(response.data);
        setGoalHours(response.data.weeklyGoalHours || 8);
      } catch (_error) {
        setData(null);
      }
    };

    loadAnalytics();
  }, []);

  const weeklyProgress = useMemo(() => {
    if (!data) return 0;
    return Math.min(100, Math.round((data.totalHoursLearned / Math.max(goalHours, 1)) * 100));
  }, [data, goalHours]);

  const recentHeatmap = useMemo(() => (data?.activityHeatmap || []).slice(-35), [data]);

  const downloadReport = async () => {
    if (!data) return;

    try {
      setReportLoading(true);
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("InternTech Progress Report", 20, 20);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 20, 30);
      doc.text(`Lessons Completed: ${data.totalLessonsCompleted}`, 20, 48);
      doc.text(`Hours Learned: ${data.totalHoursLearned}`, 20, 58);
      doc.text(`Average Quiz Score: ${data.avgQuizScore}%`, 20, 68);
      doc.text(`Current Streak: ${data.currentStreak} days`, 20, 78);
      doc.text(`Longest Streak: ${data.longestStreak} days`, 20, 88);

      doc.setFontSize(14);
      doc.text("Course Progress", 20, 108);
      doc.setFontSize(11);
      (data.courseProgress || []).forEach((course, index) => {
        doc.text(`${index + 1}. ${course.courseName}: ${course.progress}%`, 24, 118 + index * 8);
      });

      const afterCoursesY = 126 + (data.courseProgress || []).length * 8;
      doc.setFontSize(14);
      doc.text("Earned Badges", 20, afterCoursesY);
      doc.setFontSize(11);
      if (data.badges?.length) {
        data.badges.forEach((badge, index) => {
          doc.text(`- ${badge.name}`, 24, afterCoursesY + 10 + index * 8);
        });
      } else {
        doc.text("No badges earned yet.", 24, afterCoursesY + 10);
      }

      doc.save("interntech-progress-report.pdf");
    } finally {
      setReportLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        Loading progress analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Lessons Completed", data.totalLessonsCompleted],
          ["Hours Learned", data.totalHoursLearned],
          ["Avg Quiz Score", `${data.avgQuizScore}%`],
          ["Current Streak", `${data.currentStreak} days`],
          ["Longest Streak", `${data.longestStreak} days`]
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Activity Heatmap</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Your last 35 days of learning consistency.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadReport}
              className="rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy"
            >
              {reportLoading ? "Preparing..." : "Download My Progress Report"}
            </button>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2 sm:grid-cols-10 lg:grid-cols-7 xl:grid-cols-7">
            {recentHeatmap.map((item) => (
              <div
                key={item.date}
                title={`${item.date}: ${item.count} activities`}
                className={`h-9 rounded-xl ${heatColor(item.count)}`}
              />
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold">Weekly Goal</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Tune your target and keep your learning streak alive.
          </p>
          <div className="mt-6">
            <label className="text-sm font-semibold">Goal Hours: {goalHours} hrs/week</label>
            <input
              type="range"
              min="1"
              max="20"
              value={goalHours}
              onChange={(event) => setGoalHours(Number(event.target.value))}
              className="mt-3 w-full"
            />
          </div>
          <div className="mt-8 flex items-center justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="48" className="fill-none stroke-slate-200 stroke-[10] dark:stroke-slate-800" />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  className="fill-none stroke-blue stroke-[10]"
                  strokeDasharray={`${(weeklyProgress / 100) * 301.59} 301.59`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-bold">{weeklyProgress}%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">goal progress</p>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-orange-50 p-4 text-center text-sm font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
            Fire streak: {data.currentStreak} days
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold">Course Progress</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.courseProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="courseName" hide />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="progress" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold">Quiz Improvement Trend</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.quizScores.map((item) => ({
                  ...item,
                  label: new Date(item.date).toLocaleDateString("en-IN")
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold">Skill Radar</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.skillScores}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <Radar dataKey="score" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.45} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold">Time Distribution</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.timeDistribution}
                  dataKey="hours"
                  nameKey="name"
                  outerRadius={110}
                  fill="#00D4FF"
                  label
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-3xl font-bold">Badges and Achievements</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {data.badges.map((badge) => (
            <div
              key={badge.id}
              className="rounded-full bg-blue/10 px-4 py-3 text-sm font-semibold text-blue"
            >
              {badge.name}
            </div>
          ))}
          {!data.badges.length ? (
            <p className="text-slate-500 dark:text-slate-400">
              Earn certificates to unlock badges.
            </p>
          ) : null}
          <div className="rounded-full bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Placement Ready badge unlocks after 2 certificates
          </div>
          <div className="rounded-full bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Streak Master badge unlocks after 14 active days
          </div>
        </div>
      </section>
    </div>
  );
}
