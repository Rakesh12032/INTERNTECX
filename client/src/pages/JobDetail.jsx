import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data);
      } catch (_error) {
        setJob(null);
      }
    };

    fetchJob();
  }, [id]);

  const applyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to apply");
      return;
    }

    try {
      await api.post(`/jobs/${id}/apply`);
      toast.success("Application submitted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    }
  };

  if (!job) {
    return <div className="mx-auto max-w-7xl px-4 py-16">Loading job details...</div>;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1.4fr_0.8fr] lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-4xl font-bold">{job.role}</h1>
        <p className="mt-3 text-lg text-blue">{job.company}</p>
        <p className="mt-6 text-slate-600 dark:text-slate-400">{job.description}</p>
        <h2 className="mt-8 text-2xl font-bold">Responsibilities</h2>
        <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-400">
          {(job.responsibilities || []).map((item) => <li key={item}>• {item}</li>)}
        </ul>
      </section>
      <aside className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-bold">Company info</h2>
        <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex justify-between"><span>Location</span><span>{job.location}</span></div>
          <div className="flex justify-between"><span>Experience</span><span>{job.experience}</span></div>
          <div className="flex justify-between"><span>Salary</span><span>{job.salary}</span></div>
        </div>
        <button type="button" onClick={applyNow} className="mt-8 w-full rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white transition hover:bg-navy">
          Apply Now
        </button>
      </aside>
    </div>
  );
}
