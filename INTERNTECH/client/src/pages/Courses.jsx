import React, { useEffect, useState } from "react";
import { Filter, PlayCircle, BookOpen } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { mockCourses } from "../utils/mockData";

const categories = ["All", "Web Development", "Programming", "AI/ML", "Data Science", "Design", "Cloud", "Mobile Dev", "Security", "Web3", "Game Dev"];

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isOffline, setIsOffline] = useState(false);
  
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
        
        if (response.data.courses && response.data.courses.length > 0) {
           setCourses(response.data.courses);
           setPagination(response.data.pagination || { page: 1, totalPages: 1 });
           setIsOffline(false);
        } else {
           const page = selectedPage || 1;
           const limit = 6;
           const filtered = mockCourses.filter(c => 
             (selectedCategory === "All" || c.category === selectedCategory) &&
             (selectedLevel === "" || c.level.includes(selectedLevel))
           );
           setCourses(filtered.slice((page - 1) * limit, page * limit));
           setPagination({ page, totalPages: Math.ceil(filtered.length / limit) || 1 });
           setIsOffline(true);
        }
      } catch (_error) {
        const page = selectedPage || 1;
        const limit = 6;
        const filtered = mockCourses.filter(c => 
          (selectedCategory === "All" || c.category === selectedCategory) &&
          (selectedLevel === "" || c.level.includes(selectedLevel))
        );
        setCourses(filtered.slice((page - 1) * limit, page * limit));
        setPagination({ page, totalPages: Math.ceil(filtered.length / limit) || 1 });
        setIsOffline(true);
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
      {isOffline && (
        <div className="mb-6 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold shadow-sm backdrop-blur-md">
          ⚠️ Database not connected. Showing premium fallback courses with full YouTube videos!
        </div>
      )}
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

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => updateFilter("category", category)} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${selectedCategory === category ? "bg-gradient-to-r from-blue to-cyan text-white shadow-lg shadow-blue/30" : "border border-slate-200 text-slate-600 hover:border-blue hover:text-blue dark:border-slate-800 dark:text-slate-300 dark:hover:border-cyan dark:hover:text-cyan"}`}>
              {category}
            </button>
          ))}
          <select value={selectedLevel} onChange={(event) => updateFilter("level", event.target.value)} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold outline-none focus:border-blue dark:border-slate-800 dark:bg-slate-950 dark:focus:border-cyan">
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
          </select>
        </div>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-[32px] border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
            ))
          : courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.slug || course.id}`} className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.2)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan/50 dark:hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)]">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue via-cyan to-navy p-8 text-white transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all duration-500 group-hover:bg-white/20"></div>
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md">{course.category}</span>
                    <PlayCircle className="h-8 w-8 text-white/80 transition-transform duration-300 group-hover:scale-110 group-hover:text-white" />
                  </div>
                  
                  <h3 className="relative z-10 mt-12 text-2xl font-extrabold leading-tight tracking-tight drop-shadow-sm">{course.title}</h3>
                </div>
                
                <div className="mt-6 flex items-center justify-between px-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue dark:text-cyan" />
                    <span>{course.duration}</span>
                  </div>
                  <span>{course.level}</span>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 px-2 pt-5 dark:border-slate-800">
                  <span className="text-xl font-black text-navy dark:text-white">{course.price ? `₹${course.price}` : "Free Video Access"}</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-blue dark:text-cyan transition-transform group-hover:translate-x-1">
                    Enroll Now →
                  </span>
                </div>
              </Link>
            ))}
      </div>

      {!loading && !courses.length ? (
        <div className="mt-10 rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">No courses found for this filter.</p>
        </div>
      ) : null}

      <div className="mt-12 flex justify-center gap-3">
        {Array.from({ length: pagination.totalPages || 1 }).map((_, index) => (
          <button key={index} type="button" onClick={() => updateFilter("page", String(index + 1))} className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold transition-colors ${pagination.page === index + 1 ? "bg-gradient-to-r from-blue to-cyan text-white shadow-lg" : "border border-slate-200 text-slate-600 hover:border-blue hover:text-blue dark:border-slate-800 dark:text-slate-300 dark:hover:border-cyan"}`}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
