import React, { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../utils/api";

const categories = ["All", "Web Development", "Programming", "AI/ML", "Data Science", "Design", "Cloud"];

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const selectedCategory = searchParams.get("category") || "All";
  const selectedLevel = searchParams.get("level") || "";
  const selectedPage = Number(searchParams.get("page") || 1);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (selectedCategory !== "All") query.set("category", selectedCategory);
        if (selectedLevel) query.set("level", selectedLevel);
        query.set("page", selectedPage);
        query.set("limit", 6);
        const response = await api.get(`/courses?${query.toString()}`);
        setCourses(response.data.courses || []);
        setPagination(response.data.pagination || { page: 1, totalPages: 1 });
      } catch (_error) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedCategory, selectedLevel, selectedPage]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "All") next.delete(key);
    else next.set(key, value);
    next.set("page", "1");
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">Course Catalog</p>
          <h1 className="mt-2 text-4xl font-bold">Build job-ready tech skills</h1>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-slate-800 md:flex">
          <Filter className="h-4 w-4" />
          Smart Filters
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => updateFilter("category", category)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedCategory === category ? "bg-blue text-white" : "border border-slate-200 text-slate-600 hover:border-blue hover:text-blue dark:border-slate-800 dark:text-slate-300"}`}>
              {category}
            </button>
          ))}
          <select value={selectedLevel} onChange={(event) => updateFilter("level", event.target.value)} className="rounded-full border border-slate-200 px-4 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950">
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
            ))
          : courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.slug || course.id}`} className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="rounded-2xl bg-gradient-to-br from-blue via-cyan to-navy p-6 text-white">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{course.category}</span>
                  <h3 className="mt-10 text-2xl font-bold">{course.title}</h3>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>{course.duration}</span>
                  <span>{course.level}</span>
                  <span>{course.price ? `₹${course.price}` : "Free"}</span>
                </div>
              </Link>
            ))}
      </div>

      {!loading && !courses.length ? (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
          No courses found for this filter.
        </div>
      ) : null}

      <div className="mt-10 flex justify-center gap-3">
        {Array.from({ length: pagination.totalPages || 1 }).map((_, index) => (
          <button key={index} type="button" onClick={() => updateFilter("page", String(index + 1))} className={`h-11 w-11 rounded-full text-sm font-semibold ${pagination.page === index + 1 ? "bg-blue text-white" : "border border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300"}`}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
