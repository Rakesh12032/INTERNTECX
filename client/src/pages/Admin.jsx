import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

const tabs = [
  "overview",
  "students",
  "courses",
  "internships",
  "certificates",
  "withdrawals",
  "ambassadors",
  "colleges",
  "companies",
  "logs"
];

function exportRowsAsCsv(filename, headers, rows) {
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function statusChip(status) {
  if (status === "approved" || status === "active" || status === "completed") {
    return "bg-success/10 text-success";
  }
  if (status === "rejected" || status === "revoked" || status === "banned") {
    return "bg-danger/10 text-danger";
  }
  return "bg-gold/10 text-gold";
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [ambassadors, setAmbassadors] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [logs, setLogs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [certificateSearch, setCertificateSearch] = useState("");
  const [internshipFilter, setInternshipFilter] = useState("all");
  const [withdrawalFilter, setWithdrawalFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    duration: "",
    price: "",
    mentorName: "",
    mentorDesignation: "",
    mentorLinkedIn: ""
  });
  const [collegeForm, setCollegeForm] = useState({
    name: "",
    email: "",
    password: "College@123",
    city: "",
    state: ""
  });

  const loadAdminData = async (searchTerm = "") => {
    try {
      const [
        statsResponse,
        studentsResponse,
        withdrawalsResponse,
        coursesResponse,
        certificatesResponse,
        ambassadorsResponse,
        companiesResponse,
        collegesResponse,
        logsResponse,
        internshipsResponse
      ] = await Promise.all([
        api.get("/admin/stats"),
        api.get(`/admin/students${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`),
        api.get("/admin/withdrawals"),
        api.get("/admin/courses"),
        api.get("/admin/certificates"),
        api.get("/admin/ambassadors"),
        api.get("/admin/companies"),
        api.get("/admin/colleges"),
        api.get("/admin/verification-logs"),
        api.get("/admin/internship-applications")
      ]);

      setStats(statsResponse.data);
      setStudents(studentsResponse.data || []);
      setWithdrawals(withdrawalsResponse.data || []);
      setCourses(coursesResponse.data || []);
      setCertificates(certificatesResponse.data || []);
      setAmbassadors(ambassadorsResponse.data || []);
      setCompanies(companiesResponse.data || []);
      setColleges(collegesResponse.data || []);
      setLogs(logsResponse.data || []);
      setInternships(internshipsResponse.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load admin dashboard");
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAdminData(studentSearch);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [studentSearch]);

  const summaryCards = useMemo(
    () =>
      stats
        ? [
            ["Students", stats.totalStudents],
            ["Enrollments", stats.totalEnrollments],
            ["Certificates", stats.totalCertificates],
            ["Revenue", `Rs. ${stats.totalRevenue}`],
            ["Pending Internships", stats.pendingApplications],
            ["Ambassadors", stats.activeAmbassadors],
            ["Pending Withdrawals", withdrawals.filter((item) => item.status === "pending").length],
            ["Pending Companies", companies.filter((item) => item.status === "pending").length]
          ]
        : [],
    [stats, withdrawals, companies]
  );

  const filteredInternships = useMemo(
    () => internships.filter((item) => internshipFilter === "all" || item.status === internshipFilter),
    [internships, internshipFilter]
  );

  const filteredCertificates = useMemo(
    () =>
      certificates.filter((item) => {
        const search = certificateSearch.trim().toLowerCase();
        if (!search) return true;
        return (
          item.certId?.toLowerCase().includes(search) ||
          item.studentName?.toLowerCase().includes(search) ||
          item.courseName?.toLowerCase().includes(search)
        );
      }),
    [certificates, certificateSearch]
  );

  const filteredWithdrawals = useMemo(
    () => withdrawals.filter((item) => withdrawalFilter === "all" || item.status === withdrawalFilter),
    [withdrawals, withdrawalFilter]
  );

  const filteredCompanies = useMemo(
    () => companies.filter((item) => companyFilter === "all" || item.status === companyFilter),
    [companies, companyFilter]
  );

  const refresh = () => loadAdminData(studentSearch);

  const updateWithdrawal = async (id, status) => {
    try {
      await api.put(`/admin/withdrawals/${id}`, { status });
      toast.success(`Withdrawal ${status}`);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update withdrawal");
    }
  };

  const createCourse = async (event) => {
    event.preventDefault();
    try {
      await api.post("/admin/courses", courseForm);
      toast.success("Course created");
      setCourseForm({
        title: "",
        description: "",
        category: "",
        level: "Beginner",
        duration: "",
        price: "",
        mentorName: "",
        mentorDesignation: "",
        mentorLinkedIn: ""
      });
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create course");
    }
  };

  const createCollege = async (event) => {
    event.preventDefault();
    try {
      await api.post("/admin/colleges", collegeForm);
      toast.success("College registered");
      setCollegeForm({
        name: "",
        email: "",
        password: "College@123",
        city: "",
        state: ""
      });
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create college");
    }
  };

  const updateStudentStatus = async (student, action) => {
    try {
      await api.put(`/admin/students/${student.id}/${action}`);
      toast.success(action === "ban" ? "Student banned" : "Student unbanned");
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update student");
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await api.delete(`/admin/courses/${courseId}`);
      toast.success("Course deleted");
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete course");
    }
  };

  const revokeCertificate = async (certId) => {
    const reason = window.prompt("Reason for revoking this certificate?", "Revoked by admin panel");
    if (!reason) return;
    try {
      await api.put(`/admin/certificates/${certId}/revoke`, { reason });
      toast.success("Certificate revoked");
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to revoke certificate");
    }
  };

  const reissueCertificate = async (certId) => {
    try {
      await api.post(`/admin/certificates/${certId}/reissue`);
      toast.success("Certificate reissued");
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reissue certificate");
    }
  };

  const updateAmbassador = async (id, status) => {
    try {
      await api.put(`/admin/ambassadors/${id}`, { status });
      toast.success(`Ambassador ${status}`);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update ambassador");
    }
  };

  const updateCompany = async (id, action) => {
    try {
      await api.put(`/admin/companies/${id}/${action}`);
      toast.success(`Company ${action}`);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update company");
    }
  };

  const updateInternship = async (id, status) => {
    try {
      await api.put(`/admin/internship-applications/${id}`, { status });
      toast.success(`Internship application ${status}`);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update internship application");
    }
  };

  if (!stats) {
    return <div className="mx-auto max-w-7xl px-4 py-16">Loading admin dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 lg:px-8">
      <section className="rounded-[36px] bg-gradient-to-br from-navy via-blue to-cyan p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan">Admin Dashboard</p>
        <h1 className="mt-4 text-5xl font-bold">InternTech control center</h1>
      </section>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold capitalize ${
              activeTab === tab
                ? "bg-blue text-white"
                : "border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {summaryCards.map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === "students" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">Students</h2>
            <div className="flex w-full flex-col gap-3 md:max-w-2xl md:flex-row">
              <input
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Search by name, email, or college"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
              />
              <button
                type="button"
                onClick={() =>
                  exportRowsAsCsv("interntech-students.csv", ["name", "email", "college", "referralCode", "status"], students)
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700"
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">College</th>
                  <th className="pb-3">Referral Code</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-4">{student.name}</td>
                    <td className="py-4">{student.email}</td>
                    <td className="py-4">{student.college}</td>
                    <td className="py-4 font-mono text-xs">{student.referralCode}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusChip(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {student.status === "banned" ? (
                        <button
                          type="button"
                          onClick={() => updateStudentStatus(student, "unban")}
                          className="rounded-xl bg-success px-3 py-2 text-xs font-semibold text-white"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateStudentStatus(student, "ban")}
                          className="rounded-xl bg-danger px-3 py-2 text-xs font-semibold text-white"
                        >
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!students.length ? <p className="pt-6 text-slate-500 dark:text-slate-400">No students found for this search.</p> : null}
          </div>
        </section>
      ) : null}

      {activeTab === "courses" ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-bold">Add Course</h2>
            <form onSubmit={createCourse} className="mt-6 space-y-4">
              {[
                ["title", "Title"],
                ["description", "Description"],
                ["category", "Category"],
                ["duration", "Duration"],
                ["price", "Price"],
                ["mentorName", "Mentor Name"],
                ["mentorDesignation", "Mentor Designation"],
                ["mentorLinkedIn", "Mentor LinkedIn"]
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="mb-2 block text-sm font-semibold">{label}</label>
                  {key === "description" ? (
                    <textarea
                      value={courseForm[key]}
                      onChange={(event) => setCourseForm((prev) => ({ ...prev, [key]: event.target.value }))}
                      rows="4"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                    />
                  ) : (
                    <input
                      value={courseForm[key]}
                      onChange={(event) => setCourseForm((prev) => ({ ...prev, [key]: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="mb-2 block text-sm font-semibold">Level</label>
                <select
                  value={courseForm.level}
                  onChange={(event) => setCourseForm((prev) => ({ ...prev, level: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                </select>
              </div>
              <button type="submit" className="w-full rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white">
                Create Course
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-bold">All Courses</h2>
            <div className="mt-6 space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{course.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {course.category} | {course.level} | {course.duration}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Mentor: {course.mentor?.name || "InternTech Mentor"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{course.price ? `Rs. ${course.price}` : "Free"}</p>
                      <button
                        type="button"
                        onClick={() => deleteCourse(course.id)}
                        className="rounded-xl bg-danger px-3 py-2 text-xs font-semibold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "internships" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">Internship Applications</h2>
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setInternshipFilter(status)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                    internshipFilter === status ? "bg-blue text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {filteredInternships.map((application) => (
              <div key={application.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{application.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {application.trackName} | {application.college} | {application.branch}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{application.email}</p>
                    <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusChip(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => updateInternship(application.id, "approved")} className="rounded-xl bg-success px-3 py-2 text-xs font-semibold text-white">
                      Approve
                    </button>
                    <button type="button" onClick={() => updateInternship(application.id, "rejected")} className="rounded-xl bg-danger px-3 py-2 text-xs font-semibold text-white">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!filteredInternships.length ? <p className="text-slate-500 dark:text-slate-400">No internship applications for this filter.</p> : null}
          </div>
        </section>
      ) : null}

      {activeTab === "certificates" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">Certificates</h2>
            <input
              value={certificateSearch}
              onChange={(event) => setCertificateSearch(event.target.value)}
              placeholder="Search by cert ID, student, or course"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 md:max-w-md dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div className="mt-6 space-y-4">
            {filteredCertificates.map((certificate) => (
              <div key={certificate.certId} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div>
                  <p className="font-semibold">{certificate.courseName}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {certificate.studentName} | {certificate.certId}
                  </p>
                  <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusChip(certificate.status)}`}>
                    {certificate.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => revokeCertificate(certificate.certId)} className="rounded-xl bg-danger px-3 py-2 text-xs font-semibold text-white">
                    Revoke
                  </button>
                  <button type="button" onClick={() => reissueCertificate(certificate.certId)} className="rounded-xl bg-blue px-3 py-2 text-xs font-semibold text-white">
                    Reissue
                  </button>
                </div>
              </div>
            ))}
            {!filteredCertificates.length ? <p className="text-slate-500 dark:text-slate-400">No certificates found for this search.</p> : null}
          </div>
        </section>
      ) : null}

      {activeTab === "withdrawals" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">Withdrawal Requests</h2>
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setWithdrawalFilter(status)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                    withdrawalFilter === status ? "bg-blue text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {filteredWithdrawals.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{item.studentName}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Rs. {item.amount} | {item.status}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {item.bankName || "UPI"} | {item.accountNumber || item.upiId || "Details unavailable"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => updateWithdrawal(item.id, "approved")} className="rounded-xl bg-success px-3 py-2 text-xs font-semibold text-white">
                      Approve
                    </button>
                    <button type="button" onClick={() => updateWithdrawal(item.id, "rejected")} className="rounded-xl bg-danger px-3 py-2 text-xs font-semibold text-white">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!filteredWithdrawals.length ? <p className="text-slate-500 dark:text-slate-400">No withdrawals for this filter.</p> : null}
          </div>
        </section>
      ) : null}

      {activeTab === "ambassadors" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold">Ambassadors</h2>
          <div className="mt-6 space-y-4">
            {ambassadors.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.college} | {item.status}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateAmbassador(item.id, "approved")} className="rounded-xl bg-success px-3 py-2 text-xs font-semibold text-white">
                    Approve
                  </button>
                  <button type="button" onClick={() => updateAmbassador(item.id, "rejected")} className="rounded-xl bg-danger px-3 py-2 text-xs font-semibold text-white">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "colleges" ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-bold">Register College</h2>
            <form onSubmit={createCollege} className="mt-6 space-y-4">
              {[
                ["name", "College Name"],
                ["email", "Email"],
                ["password", "Password"],
                ["city", "City"],
                ["state", "State"]
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="mb-2 block text-sm font-semibold">{label}</label>
                  <input
                    value={collegeForm[key]}
                    onChange={(event) => setCollegeForm((prev) => ({ ...prev, [key]: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              ))}
              <button type="submit" className="w-full rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white">
                Create College
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-bold">Registered Colleges</h2>
            <div className="mt-6 space-y-4">
              {colleges.map((college) => (
                <div key={college.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="font-semibold">{college.name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {college.email} | {college.city}, {college.state}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "companies" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">Companies</h2>
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setCompanyFilter(status)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                    companyFilter === status ? "bg-blue text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {filteredCompanies.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div>
                  <p className="font-semibold">{item.companyName}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {item.email} | {item.status}
                  </p>
                  <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusChip(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateCompany(item.id, "approve")} className="rounded-xl bg-success px-3 py-2 text-xs font-semibold text-white">
                    Approve
                  </button>
                  <button type="button" onClick={() => updateCompany(item.id, "reject")} className="rounded-xl bg-danger px-3 py-2 text-xs font-semibold text-white">
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {!filteredCompanies.length ? <p className="text-slate-500 dark:text-slate-400">No companies for this filter.</p> : null}
          </div>
        </section>
      ) : null}

      {activeTab === "logs" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold">Verification Logs</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="pb-3">Cert ID</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Verified At</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-4">{log.certId}</td>
                    <td className="py-4">{log.status}</td>
                    <td className="py-4">{new Date(log.verifiedAt).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
