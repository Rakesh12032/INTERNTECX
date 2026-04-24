import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const HISTORY_KEY = "interntech_college_verification_history";

function exportBulkCsv(rows) {
  const lines = [
    ["Cert ID", "Student", "Course", "Status"].join(","),
    ...rows.map((row) => [row.certId, row.student, row.course, row.status].join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "college-verification-results.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportBulkPdf(rows, collegeName) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`${collegeName} Verification Report`, 20, 20);
  doc.setFontSize(11);
  let y = 36;
  rows.forEach((row, index) => {
    doc.text(`${index + 1}. ${row.certId} | ${row.student} | ${row.course} | ${row.status}`, 20, y);
    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });
  doc.save("college-verification-report.pdf");
}

export default function CollegeVerify() {
  const { login, user, isCollege } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "", institutionName: "" });
  const [collegeUser, setCollegeUser] = useState(null);
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState(null);
  const [bulkIds, setBulkIds] = useState("");
  const [bulkResults, setBulkResults] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isCollege?.() && user) {
      setCollegeUser(user);
    }
  }, [isCollege, user]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      setHistory(Array.isArray(stored) ? stored : []);
    } catch (_error) {
      setHistory([]);
    }
  }, []);

  const saveHistory = (entries) => {
    setHistory((previous) => {
      const next = [...entries, ...previous].slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const loginCollege = async () => {
    try {
      const response = await api.post("/college/login", {
        email: credentials.email,
        password: credentials.password
      });
      login(response.data.token, response.data.user);
      setCollegeUser(response.data.user);
      toast.success("College login successful");
    } catch (error) {
      toast.error(error.response?.data?.message || "College login failed");
    }
  };

  const verifyCert = async () => {
    try {
      const response = await api.get(`/certificates/verify/${certId}`);
      setResult(response.data);
      saveHistory([{
        certId,
        student: response.data.data?.studentName || "-",
        course: response.data.data?.courseName || "-",
        status: response.data.valid ? "Verified" : "Invalid",
        checkedAt: new Date().toISOString()
      }]);
    } catch (error) {
      setResult(error.response?.data || { valid: false });
      saveHistory([{
        certId,
        student: "-",
        course: "-",
        status: "Invalid",
        checkedAt: new Date().toISOString()
      }]);
    }
  };

  const handleBulkFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setBulkIds(text);
  };

  const runBulkVerify = async () => {
    try {
      const ids = bulkIds
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

      const responses = await Promise.all(
        ids.map(async (id) => {
          try {
            const response = await api.get(`/certificates/verify/${id}`);
            return {
              certId: id,
              student: response.data.data?.studentName || "-",
              course: response.data.data?.courseName || "-",
              status: response.data.valid ? "Verified" : "Invalid"
            };
          } catch (_error) {
            return {
              certId: id,
              student: "-",
              course: "-",
              status: "Invalid"
            };
          }
        })
      );

      setBulkResults(responses);
      saveHistory(responses.map((item) => ({ ...item, checkedAt: new Date().toISOString() })));
      toast.success("Bulk verification complete");
    } catch (_error) {
      toast.error("Bulk verification failed");
    }
  };

  if (!collegeUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-[36px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-bold">College Portal Login</h1>
          <div className="mt-6 space-y-4">
            {[
              ["institutionName", "Institution Name"],
              ["email", "Email"],
              ["password", "Password"]
            ].map(([key, label]) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-semibold">{label}</label>
                <input
                  type={key === "password" ? "password" : "text"}
                  value={credentials[key]}
                  onChange={(event) => setCredentials((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            ))}
            <button type="button" onClick={loginCollege} className="w-full rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white">
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-16">
      <div className="rounded-[36px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-bold">{collegeUser.name} Verification Dashboard</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Total Checks", history.length],
            ["Verified", history.filter((item) => item.status === "Verified").length],
            ["Invalid", history.filter((item) => item.status !== "Verified").length]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input value={certId} onChange={(event) => setCertId(event.target.value)} placeholder="Enter certificate ID" className="flex-1 rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-700 dark:bg-slate-950" />
          <button type="button" onClick={verifyCert} className="rounded-2xl bg-blue px-6 py-4 text-sm font-semibold text-white">
            Verify
          </button>
        </div>
        {result ? (
          <div className="mt-8 rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            {result.valid ? (
              <>
                <p className="font-bold text-success">Verified</p>
                <p className="mt-2">Student: {result.data.studentName}</p>
                <p>Course: {result.data.courseName}</p>
                <p>College: {result.data.college}</p>
                <p>Certificate ID: {result.data.certId}</p>
                <p>Duration: {result.data.duration}</p>
              </>
            ) : (
              <p className="font-bold text-danger">Certificate not valid</p>
            )}
          </div>
        ) : null}
      </div>

      <div className="rounded-[36px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Bulk Verify</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Upload a CSV or paste one certificate ID per line.</p>
          </div>
          {bulkResults.length ? (
            <div className="flex gap-3">
              <button type="button" onClick={() => exportBulkCsv(bulkResults)} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700">
                Export CSV
              </button>
              <button type="button" onClick={() => exportBulkPdf(bulkResults, collegeUser.name)} className="rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white">
                Export PDF
              </button>
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <input type="file" accept=".csv,.txt" onChange={handleBulkFile} className="text-sm" />
          <textarea value={bulkIds} onChange={(event) => setBulkIds(event.target.value)} rows="8" className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" placeholder="INT-2026-1234" />
          <button type="button" onClick={runBulkVerify} className="self-start rounded-2xl bg-blue px-6 py-3 text-sm font-semibold text-white">
            Run Bulk Verification
          </button>
        </div>

        {bulkResults.length ? (
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="pb-3">Cert ID</th>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bulkResults.map((item) => (
                  <tr key={item.certId} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-4">{item.certId}</td>
                    <td className="py-4">{item.student}</td>
                    <td className="py-4">{item.course}</td>
                    <td className="py-4">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="rounded-[36px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-bold">Verification History</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Recent verification checks from this browser session.</p>
        {!history.length ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">No verification history yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="pb-3">Checked At</th>
                  <th className="pb-3">Cert ID</th>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={`${item.certId}-${index}`} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-4">{new Date(item.checkedAt).toLocaleString("en-IN")}</td>
                    <td className="py-4">{item.certId}</td>
                    <td className="py-4">{item.student}</td>
                    <td className="py-4">{item.course}</td>
                    <td className="py-4">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
