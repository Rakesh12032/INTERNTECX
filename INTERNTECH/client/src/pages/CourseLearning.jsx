import React, { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";
import { generateCertificatePDF } from "../utils/generateCertificate";
import { mockCourses } from "../utils/mockData";

function progressWidth(value) {
  return { width: `${value || 0}%` };
}

export default function CourseLearning() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [marking, setMarking] = useState(false);
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const [courseResponse, progressResponse, certificateResponse] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/courses/${courseId}/progress`),
          api.get("/certificates/my")
        ]);

        setCourse(courseResponse.data);
        setProgress(progressResponse.data.enrollment);

        const matchingCertificate = (certificateResponse.data || []).find(
          (item) =>
            item.courseId === courseResponse.data.id || item.courseName === courseResponse.data.title
        );

        setCertificate(matchingCertificate || null);
        const firstLesson = courseResponse.data.modules?.[0]?.lessons?.[0];
        setActiveLessonId(firstLesson?.id || null);
      } catch (_error) {
        // Fallback to mock data
        const mockCourse = mockCourses.find((c) => c.id === courseId || c.slug === courseId);
        if (mockCourse) {
          setCourse(mockCourse);
          setProgress({ completedLessons: [], progress: 0, quizUnlocked: false });
          const firstLesson = mockCourse.modules?.[0]?.lessons?.[0];
          setActiveLessonId(firstLesson?.id || null);
          setCertificate(null);
        } else {
          setCourse(null);
        }
      }
    };

    loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (certificate) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.65 }
      });
    }
  }, [certificate]);

  const lessons = useMemo(() => course?.modules.flatMap((module) => module.lessons) || [], [course]);
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) || lessons[0];

  const markComplete = async () => {
    try {
      setMarking(true);

      try {
        const response = await api.post("/courses/lesson/complete", {
          courseId: course.id,
          lessonId: activeLesson.id
        });

        await api.post("/analytics/log-activity", {
          type: "lesson_complete"
        });

        setProgress((previous) => ({
          ...previous,
          completedLessons: [...new Set([...(previous?.completedLessons || []), activeLesson.id])],
          progress: response.data.progress,
          quizUnlocked: response.data.quizUnlocked
        }));

        toast.success("Lesson marked complete");
      } catch (apiError) {
        // Offline Fallback Logic
        setProgress((previous) => {
          const prevCompleted = previous?.completedLessons || [];
          const newCompleted = [...new Set([...prevCompleted, activeLesson.id])];
          const progressPercent = Math.round((newCompleted.length / lessons.length) * 100);
          const quizUnlocked = progressPercent === 100;
          
          if (quizUnlocked) toast.success("🎉 All lessons done! Quiz unlocked.");
          else toast.success("Lesson marked complete!");
          
          return {
            ...previous,
            completedLessons: newCompleted,
            progress: progressPercent,
            quizUnlocked
          };
        });
      }
    } catch (error) {
      toast.error("Unable to mark complete");
    } finally {
      setMarking(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificate) return;
    const doc = generateCertificatePDF(certificate);
    doc.save(`${certificate.certId}.pdf`);
  };

  if (!course || !activeLesson) {
    return <div className="mx-auto max-w-7xl px-4 py-16">Loading learning dashboard...</div>;
  }

  const completedLessons = progress?.completedLessons || [];

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[340px_1fr] lg:px-8">
      <aside className="h-fit rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-5 dark:from-slate-800/50 dark:to-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-blue dark:text-cyan">Progress Report</p>
          <h2 className="mt-2 text-xl font-extrabold leading-tight text-slate-900 dark:text-white">{course.title}</h2>
          
          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{progress?.progress || 0}%</p>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                {completedLessons.length} of {lessons.length} lessons completed
              </p>
            </div>
          </div>
          
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-blue to-cyan transition-all duration-700 ease-out" style={progressWidth(progress?.progress || 0)} />
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {course.modules.map((module, index) => (
            <div key={module.id}>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue/10 text-xs font-bold text-blue dark:text-cyan">{index + 1}</div>
                <p className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
                  {module.title}
                </p>
              </div>
              <div className="mt-3 ml-3 border-l-2 border-slate-100 pl-4 space-y-2 dark:border-slate-800">
                {module.lessons.map((lesson) => {
                  const isDone = completedLessons.includes(lesson.id);
                  const isActive = activeLesson?.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`group relative flex w-full flex-col items-start justify-center rounded-xl px-4 py-3 text-left text-sm transition-all duration-300 ${
                        isActive
                          ? "bg-blue text-white shadow-md shadow-blue/20"
                          : "bg-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={`font-semibold ${isDone && !isActive ? "text-success" : ""}`}>{lesson.title}</span>
                        {isDone ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">✓</span>
                        ) : null}
                      </div>
                      <span className={`mt-1 text-xs font-medium ${isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>{lesson.duration}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative overflow-hidden rounded-3xl h-[360px] sm:h-[480px] bg-slate-900">
          {(() => {
            try {
              const url = new URL(activeLesson.videoUrl);
              url.searchParams.set("modestbranding", "1"); // Hide YouTube logo
              url.searchParams.set("rel", "0"); // Hide related videos from other channels
              url.searchParams.set("showinfo", "0"); // Hide video title
              url.searchParams.set("iv_load_policy", "3"); // Hide annotations
              return (
                <iframe
                  title={activeLesson.title}
                  src={url.toString()}
                  className="absolute top-0 left-0 h-full w-full border-none"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                />
              );
            } catch (e) {
              return (
                <iframe
                  title={activeLesson.title}
                  src={activeLesson.videoUrl}
                  className="absolute top-0 left-0 h-full w-full border-none"
                  allowFullScreen
                />
              );
            }
          })()}
          
          {/* Invisible protective overlay to block clicking the top title/links to YouTube */}
          <div className="absolute top-0 left-0 right-0 h-20 z-10 bg-transparent pointer-events-auto" onContextMenu={(e) => e.preventDefault()}></div>
        </div>
        <h1 className="mt-6 text-3xl font-bold">{activeLesson.title}</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{activeLesson.description}</p>
        <button
          type="button"
          onClick={markComplete}
          disabled={marking}
          className="mt-8 rounded-2xl bg-blue px-6 py-4 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-70"
        >
          {marking ? "Saving..." : "Mark as Complete"}
        </button>

        {progress?.quizUnlocked ? (
          <div className="mt-8 rounded-3xl border border-success bg-success/10 p-6">
            <h2 className="text-2xl font-bold text-success">
              All lessons done! Take your final assessment.
            </h2>
            <Link
              to={`/quiz/${course.slug || course.id}`}
              className="mt-4 inline-block text-sm font-semibold text-blue"
            >
              Start Quiz
            </Link>
          </div>
        ) : null}

        {certificate ? (
          <div className="mt-8 rounded-3xl border border-gold bg-gold/10 p-6">
            <h2 className="text-2xl font-bold text-gold">Certificate Generated</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              You passed the assessment for {certificate.courseName}. Your certificate is now
              available.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={downloadCertificate}
                className="rounded-2xl bg-blue px-5 py-3 text-sm font-semibold text-white"
              >
                Download Certificate
              </button>
              <Link
                to="/dashboard/certificates"
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold dark:border-slate-700"
              >
                Open Certificates
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
