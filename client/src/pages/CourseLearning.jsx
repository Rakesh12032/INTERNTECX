import React, { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";
import { generateCertificatePDF } from "../utils/generateCertificate";
import { getCourseVideoUrl } from "../utils/courseVideos";

function progressWidth(value) {
  if (value >= 100) return "w-full";
  if (value >= 80) return "w-4/5";
  if (value >= 60) return "w-3/5";
  if (value >= 40) return "w-2/5";
  if (value >= 20) return "w-1/5";
  return "w-[8%]";
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
        setCourse(null);
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
  const activeVideoUrl =
    activeLesson?.videoUrl && !activeLesson.videoUrl.includes("dQw4w9WgXcQ")
      ? activeLesson.videoUrl
      : getCourseVideoUrl(course);

  const markComplete = async () => {
    try {
      setMarking(true);

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
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to mark complete");
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
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[320px_1fr] lg:px-8">
      <aside className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-bold">{course.title}</h2>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {completedLessons.length}/{lessons.length} lessons complete
        </p>
        <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className={`h-3 rounded-full bg-blue ${progressWidth(progress?.progress || 0)}`} />
        </div>

        <div className="mt-6 space-y-4">
          {course.modules.map((module) => (
            <div key={module.id}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">
                {module.title}
              </p>
              <div className="mt-3 space-y-2">
                {module.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm ${
                      activeLesson?.id === lesson.id
                        ? "bg-blue text-white"
                        : "bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    <span>{lesson.title}</span>
                    <span>{completedLessons.includes(lesson.id) ? "Done" : lesson.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-hidden rounded-3xl">
          <iframe
            title={activeLesson.title}
            src={activeVideoUrl}
            className="h-[360px] w-full rounded-3xl"
            allowFullScreen
          />
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
