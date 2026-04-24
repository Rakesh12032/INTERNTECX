import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function QuizCenter() {
  const [courses, setCourses] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizCenter = async () => {
      try {
        const coursesResponse = await api.get("/courses/my");
        const enrolledCourses = coursesResponse.data.courses || [];
        setCourses(enrolledCourses);

        const attemptsResponses = await Promise.all(
          enrolledCourses.map(async (course) => {
            try {
              const response = await api.get(`/quiz/attempts/${course.id}`);
              return [course.id, response.data || []];
            } catch (_error) {
              return [course.id, []];
            }
          })
        );

        setAttempts(Object.fromEntries(attemptsResponses));
      } catch (_error) {
        setCourses([]);
        setAttempts({});
      } finally {
        setLoading(false);
      }
    };

    loadQuizCenter();
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-16">Loading quiz center...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 lg:px-8">
      <section className="rounded-[36px] bg-gradient-to-br from-navy via-blue to-cyan p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan">Quiz Center</p>
        <h1 className="mt-4 text-5xl font-bold">Assess your progress</h1>
        <p className="mt-4 max-w-2xl text-slate-100">
          Start final assessments for completed courses, review attempt history, and move toward
          certificate eligibility.
        </p>
      </section>

      {courses.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {courses.map((course) => {
            const courseAttempts = attempts[course.id] || [];
            const lastAttempt = courseAttempts[courseAttempts.length - 1];
            const isUnlocked = Boolean(course.enrollment?.quizUnlocked || course.enrollment?.progress === 100);

            return (
              <div
                key={course.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-blue">{course.category}</p>
                    <h2 className="mt-2 text-2xl font-bold">{course.title}</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Progress: {course.enrollment?.progress || 0}% | Attempts used: {courseAttempts.length}/3
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isUnlocked ? "bg-success/10 text-success" : "bg-gold/10 text-gold"
                    }`}
                  >
                    {isUnlocked ? "Ready" : "Locked"}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-sm font-semibold">Latest Attempt</p>
                  {lastAttempt ? (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Score {lastAttempt.score}% on{" "}
                      {new Date(lastAttempt.timestamp).toLocaleDateString("en-IN")} |{" "}
                      {lastAttempt.passed ? "Passed" : "Not passed yet"}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      No attempts yet for this course.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {isUnlocked ? (
                    <Link
                      to={`/quiz/${course.slug || course.id}`}
                      className="rounded-2xl bg-blue px-5 py-3 text-sm font-semibold text-white"
                    >
                      Start Assessment
                    </Link>
                  ) : (
                    <Link
                      to={`/learn/${course.slug || course.id}`}
                      className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold dark:border-slate-700"
                    >
                      Continue Course
                    </Link>
                  )}
                  <Link
                    to={`/learn/${course.slug || course.id}`}
                    className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold dark:border-slate-700"
                  >
                    Open Learning
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Enroll in a course first. Your unlocked assessments will appear here automatically.
        </div>
      )}
    </div>
  );
}
