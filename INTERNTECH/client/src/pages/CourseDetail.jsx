import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
      } catch (_error) {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      setEnrolling(true);
      await api.post("/courses/enroll", { courseId: course.id });
      toast.success("Enrollment successful");
      navigate(`/learn/${course.slug || course.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-16">Loading course details...</div>;
  }

  if (!course) {
    return <div className="mx-auto max-w-7xl px-4 py-16">Course not found.</div>;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1.6fr_0.9fr] lg:px-8">
      <div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-blue">Home</Link> / <Link to="/courses" className="hover:text-blue">Courses</Link> / {course.title}
        </div>
        <h1 className="mt-4 text-4xl font-bold">{course.title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">{course.overview}</p>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">What you'll learn</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {course.modules.slice(0, 6).map((module) => (
              <div key={module.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                <div>
                  <p className="font-semibold">{module.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{module.lessons.length} lessons</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Syllabus</h2>
          <div className="mt-4 space-y-4">
            {course.modules.map((module) => (
              <div key={module.id} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-xl font-semibold">{module.title}</h3>
                <div className="mt-4 space-y-3">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950">
                      <span>{lesson.title}</span>
                      <span className="text-slate-500 dark:text-slate-400">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-[28px] bg-gradient-to-br from-blue via-cyan to-navy p-8 text-white">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{course.category}</span>
            <h3 className="mt-12 text-3xl font-bold">{course.title}</h3>
          </div>
          <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex justify-between"><span>Duration</span><span>{course.duration}</span></div>
            <div className="flex justify-between"><span>Level</span><span>{course.level}</span></div>
            <div className="flex justify-between"><span>Enrolled</span><span>{course.enrolledCount}+</span></div>
            <div className="flex justify-between"><span>Price</span><span>{course.price ? `₹${course.price}` : "Free"}</span></div>
          </div>
          <button type="button" onClick={handleEnroll} disabled={enrolling} className="mt-6 w-full rounded-2xl bg-blue px-5 py-4 text-sm font-semibold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-70">
            {enrolling ? "Enrolling..." : "Enroll Now"}
          </button>
          <div className="mt-8 rounded-3xl border border-gold/20 bg-gold/10 p-5">
            <p className="font-semibold text-navy dark:text-gold">Certificate Preview</p>
            <div className="mt-4 rounded-2xl border border-dashed border-gold/40 bg-white/70 p-6 text-center text-sm text-slate-600 dark:bg-slate-950/40 dark:text-slate-300">
              Complete the course and pass the final quiz to unlock your premium InternTech certificate.
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
