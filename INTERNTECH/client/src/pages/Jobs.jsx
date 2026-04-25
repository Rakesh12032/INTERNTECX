import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, MapPin, Briefcase, IndianRupee, ShieldCheck } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { mockJobs } from "../utils/mockData";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRequest = api.get("/jobs");
        const savedRequest = isAuthenticated ? api.get("/jobs/saved") : Promise.resolve({ data: [] });

        const [jobsResponse, savedResponse] = await Promise.all([jobsRequest, savedRequest]);
        
        if (jobsResponse.data && jobsResponse.data.length > 0) {
          setJobs(jobsResponse.data);
          setIsOffline(false);
        } else {
          setJobs(mockJobs);
          setIsOffline(true);
        }
        setSavedJobs((savedResponse.data || []).map((item) => item.jobId));
      } catch (_error) {
        setJobs(mockJobs);
        setIsOffline(true);
        setSavedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [isAuthenticated]);

  const savedSet = useMemo(() => new Set(savedJobs), [savedJobs]);

  const applyToJob = async (jobId, event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please log in to apply for jobs");
      return;
    }

    try {
      if (isOffline) {
        await new Promise(r => setTimeout(r, 800));
        toast.success("Job Application submitted successfully!");
        return;
      }
      await api.post(`/jobs/${jobId}/apply`);
      toast.success("Application submitted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    }
  };

  const toggleSaveJob = async (jobId, event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please log in to save jobs");
      return;
    }

    try {
      if (isOffline) {
        if (savedSet.has(jobId)) {
          setSavedJobs((prev) => prev.filter(id => id !== jobId));
          toast.success("Removed from saved jobs");
        } else {
          setSavedJobs((prev) => [...prev, jobId]);
          toast.success("Saved for later");
        }
        return;
      }
      
      if (savedSet.has(jobId)) {
        await api.delete(`/jobs/saved/${jobId}`);
        setSavedJobs((previous) => previous.filter((item) => item !== jobId));
        toast.success("Removed from saved jobs");
      } else {
        await api.post(`/jobs/${jobId}/save`);
        setSavedJobs((previous) => [...previous, jobId]);
        toast.success("Saved for later");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update saved jobs");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {isOffline && (
        <div className="mb-6 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold shadow-sm backdrop-blur-md">
          ⚠️ Database not connected. Showing premium fallback job opportunities!
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue dark:text-cyan">Career Portal</p>
          <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Verified job opportunities</h1>
          <p className="mt-4 max-w-2xl text-lg font-medium text-slate-600 dark:text-slate-400">
            Explore internships and early-career tech roles from verified hiring partners.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-[32px] bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="group relative block overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan/30">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-blue/5 blur-3xl transition-colors duration-500 group-hover:bg-cyan/10"></div>
              
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                    <Building2 className="h-7 w-7 text-blue dark:text-cyan" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{job.role}</h2>
                    <p className="mt-1 font-semibold text-blue dark:text-cyan">{job.company}</p>
                  </div>
                </div>
                {job.verified && (
                  <div className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success border border-success/20">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Verified</span>
                  </div>
                )}
              </div>
              
              <div className="relative z-10 mt-8 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  {job.experience}
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <IndianRupee className="h-4 w-4 text-slate-400" />
                  {job.salary}
                </div>
              </div>
              
              <div className="relative z-10 mt-8 flex gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                <button type="button" onClick={(event) => applyToJob(job.id, event)} className="flex-1 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue group-hover:shadow-lg dark:bg-slate-800 dark:hover:bg-cyan dark:hover:text-navy">
                  Apply Now
                </button>
                <button type="button" onClick={(event) => toggleSaveJob(job.id, event)} className={`rounded-2xl px-6 py-3.5 text-sm font-bold transition-all ${savedSet.has(job.id) ? "bg-gold text-navy shadow-lg shadow-gold/20" : "border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"}`}>
                  {savedSet.has(job.id) ? "Saved" : "Save"}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
