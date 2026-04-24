import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function CompanyPortal() {
  const { login, user, isCompany } = useAuth();
  const [mode, setMode] = useState("login");
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [stats, setStats] = useState({ jobsPosted: 0, totalApplicants: 0, shortlisted: 0, pending: 0 });
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authForm, setAuthForm] = useState({
    companyName: "",
    email: "",
    password: "",
    location: ""
  });
  const [jobForm, setJobForm] = useState({
    role: "",
    location: "",
    experience: "",
    salary: "",
    description: ""
  });

  const statusColor = (status) => {
    if (status === "shortlisted") return "bg-success/10 text-success";
    if (status === "rejected") return "bg-danger/10 text-danger";
    return "bg-blue/10 text-blue";
  };

  const loadCompanyData = async () => {
    try {
      setLoadingDashboard(true);
      const [jobsResponse, applicantsResponse, statsResponse] = await Promise.all([
        api.get("/company/jobs"),
        api.get("/company/applicants"),
        api.get("/company/stats")
      ]);
      setJobs(jobsResponse.data || []);
      setApplicants(applicantsResponse.data || []);
      setStats(statsResponse.data || { jobsPosted: 0, totalApplicants: 0, shortlisted: 0, pending: 0 });
    } catch (_error) {
      setJobs([]);
      setApplicants([]);
      setStats({ jobsPosted: 0, totalApplicants: 0, shortlisted: 0, pending: 0 });
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (company) {
      loadCompanyData();
    }
  }, [company]);

  useEffect(() => {
    if (isCompany?.() && user) {
      setCompany(user);
    }
  }, [isCompany, user]);

  const submitRegister = async () => {
    if (!authForm.companyName || !authForm.email || !authForm.password || !authForm.location) {
      toast.error("Please fill all registration fields");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/company/register", authForm);
      toast.success("Company registration submitted for approval");
      setMode("login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const submitLogin = async () => {
    if (!authForm.email || !authForm.password) {
      toast.error("Enter email and password");
      return;
    }
    try {
      setSubmitting(true);
      const response = await api.post("/company/login", {
        email: authForm.email,
        password: authForm.password
      });
      login(response.data.token, response.data.user);
      setCompany(response.data.user);
      toast.success("Company login successful");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const postJob = async () => {
    if (!jobForm.role || !jobForm.location || !jobForm.experience || !jobForm.salary || !jobForm.description) {
      toast.error("Complete all job fields before posting");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/company/jobs", jobForm);
      toast.success("Job posted successfully");
      setJobForm({
        role: "",
        location: "",
        experience: "",
        salary: "",
        description: ""
      });
      loadCompanyData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  const updateApplicant = async (id, status) => {
    try {
      await api.put(`/company/applicants/${id}`, { status });
      toast.success(`Applicant marked ${status}`);
      loadCompanyData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update applicant");
    }
  };

  if (!company) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-[36px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex gap-3">
            <button type="button" onClick={() => setMode("login")} className={`rounded-2xl px-4 py-2 text-sm font-semibold ${mode === "login" ? "bg-blue text-white" : "border border-slate-200 dark:border-slate-700"}`}>
              Login
            </button>
            <button type="button" onClick={() => setMode("register")} className={`rounded-2xl px-4 py-2 text-sm font-semibold ${mode === "register" ? "bg-blue text-white" : "border border-slate-200 dark:border-slate-700"}`}>
              Register
            </button>
          </div>
          <h1 className="text-3xl font-bold">{mode === "login" ? "Company Login" : "Register Company"}</h1>
          <div className="mt-6 space-y-4">
            {mode === "register" ? (
              <div>
                <label className="mb-2 block text-sm font-semibold">Company Name</label>
                <input value={authForm.companyName} onChange={(event) => setAuthForm((prev) => ({ ...prev, companyName: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
              </div>
            ) : null}
            <div>
              <label className="mb-2 block text-sm font-semibold">Email</label>
              <input value={authForm.email} onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Password</label>
              <input type="password" value={authForm.password} onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
            </div>
            {mode === "register" ? (
              <div>
                <label className="mb-2 block text-sm font-semibold">Location</label>
                <input value={authForm.location} onChange={(event) => setAuthForm((prev) => ({ ...prev, location: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
              </div>
            ) : null}
            <button type="button" onClick={mode === "login" ? submitLogin : submitRegister} className="w-full rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white transition hover:bg-navy">
              {submitting ? "Please wait..." : mode === "login" ? "Login" : "Register Company"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-16">
      <div className="rounded-[36px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-bold">{company.name} Company Dashboard</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Post jobs and manage applicants from one place.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Jobs Posted", stats.jobsPosted],
            ["Total Applicants", stats.totalApplicants],
            ["Shortlisted", stats.shortlisted],
            ["Pending Review", stats.pending]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[36px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold">Post Job</h2>
          <div className="mt-8 grid gap-4">
            {[
              ["role", "Role"],
              ["location", "Location"],
              ["experience", "Experience"],
              ["salary", "Salary"],
              ["description", "Description"]
            ].map(([key, label]) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-semibold">{label}</label>
                {key === "description" ? (
                  <textarea value={jobForm[key]} onChange={(event) => setJobForm((prev) => ({ ...prev, [key]: event.target.value }))} rows="5" className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
                ) : (
                  <input value={jobForm[key]} onChange={(event) => setJobForm((prev) => ({ ...prev, [key]: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
                )}
              </div>
            ))}
            <button type="button" onClick={postJob} className="rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white transition hover:bg-navy">
              {submitting ? "Submitting..." : "Post Job"}
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[36px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-bold">My Jobs</h2>
            <div className="mt-6 space-y-4">
              {loadingDashboard ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading company jobs...</p> : null}
              {jobs.map((job) => (
                <div key={job.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{job.role}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{job.location} | {job.experience} | {job.salary}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{job.applicantCount || 0} applicants</p>
                    </div>
                    <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold text-blue">
                      Live
                    </span>
                  </div>
                </div>
              ))}
              {!jobs.length ? <p className="text-slate-500 dark:text-slate-400">No jobs posted yet.</p> : null}
            </div>
          </div>

          <div className="rounded-[36px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-bold">Applicants</h2>
            <div className="mt-6 space-y-4">
              {loadingDashboard ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading applicants...</p> : null}
              {applicants.map((applicant) => (
                <div key={applicant.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{applicant.studentName}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {applicant.jobRole} | {applicant.college} | {applicant.branch}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{applicant.studentEmail}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Applied on {new Date(applicant.appliedAt).toLocaleDateString("en-IN")} for {applicant.jobLocation}</p>
                      <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColor(applicant.status)}`}>
                        {applicant.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => updateApplicant(applicant.id, "shortlisted")} className="rounded-xl bg-blue px-3 py-2 text-xs font-semibold text-white">
                        Shortlist
                      </button>
                      <button type="button" onClick={() => updateApplicant(applicant.id, "rejected")} className="rounded-xl bg-danger px-3 py-2 text-xs font-semibold text-white">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!applicants.length ? <p className="text-slate-500 dark:text-slate-400">No applicants yet.</p> : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
