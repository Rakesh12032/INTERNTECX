import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function MyJobs() {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("applications");
  const [loading, setLoading] = useState(true);

  const statusColor = (status) => {
    if (status === "shortlisted") return "bg-success/10 text-success";
    if (status === "rejected") return "bg-danger/10 text-danger";
    return "bg-blue/10 text-blue";
  };

  const loadJobsData = async () => {
    try {
      const [applicationsResponse, savedResponse] = await Promise.all([
        api.get("/jobs/my/applications"),
        api.get("/jobs/saved")
      ]);
      setApplications(applicationsResponse.data || []);
      setSavedJobs(savedResponse.data || []);
    } catch (_error) {
      setApplications([]);
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobsData();
  }, []);

  const removeSavedJob = async (jobId) => {
    try {
      await api.delete(`/jobs/saved/${jobId}`);
      setSavedJobs((previous) => previous.filter((item) => item.jobId !== jobId));
      toast.success("Removed from saved jobs");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to remove saved job");
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">My Jobs</h1>
        <div className="flex gap-3">
          {[
            ["applications", `Applications (${applications.length})`],
            ["saved", `Saved (${savedJobs.length})`]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                activeTab === value
                  ? "bg-blue text-white"
                  : "border border-slate-300 dark:border-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : activeTab === "applications" ? (
        <div className="mt-6 space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{application.jobRole}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {application.company} | {application.location} | {application.salary}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Applied on {new Date(application.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>
              </div>
            </div>
          ))}
          {!applications.length ? (
            <p className="text-slate-500 dark:text-slate-400">
              You have not applied to any jobs yet.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {savedJobs.map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.job.role}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {item.job.company} | {item.job.location} | {item.job.salary}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Saved on {new Date(item.savedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/jobs/${item.job.id}`}
                    className="rounded-xl bg-blue px-3 py-2 text-xs font-semibold text-white"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeSavedJob(item.job.id)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!savedJobs.length ? (
            <p className="text-slate-500 dark:text-slate-400">
              No saved jobs yet. Save roles from the jobs page to revisit them later.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
