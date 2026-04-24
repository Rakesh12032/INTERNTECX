import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRequest = api.get("/jobs");
        const savedRequest = isAuthenticated ? api.get("/jobs/saved") : Promise.resolve({ data: [] });

        const [jobsResponse, savedResponse] = await Promise.all([jobsRequest, savedRequest]);
        setJobs(jobsResponse.data || []);
        setSavedJobs((savedResponse.data || []).map((item) => item.jobId));
      } catch (_error) {
        setJobs([]);
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
      <h1 className="text-4xl font-bold">Verified job opportunities</h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
        Explore internships and early-career tech roles from verified hiring partners.
      </p>

      {loading ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{job.role}</h2>
                  <p className="mt-2 text-blue">{job.company}</p>
                </div>
                {job.verified ? (
                  <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    InternTech Verified Hiring
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span>{job.location}</span>
                <span>{job.experience}</span>
                <span>{job.salary}</span>
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={(event) => applyToJob(job.id, event)}
                  className="rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={(event) => toggleSaveJob(job.id, event)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    savedSet.has(job.id)
                      ? "bg-gold text-navy"
                      : "border border-slate-300 dark:border-slate-700"
                  }`}
                >
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
