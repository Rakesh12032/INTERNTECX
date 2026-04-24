import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { jsPDF } from "jspdf";
import { VerifyQRCode } from "../utils/qrHelper";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [certId, setCertId] = useState(searchParams.get("id") || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [letterLoading, setLetterLoading] = useState(false);

  const verifyCertificate = async (targetId = certId) => {
    if (!targetId) return;
    try {
      setLoading(true);
      const response = await api.get(`/certificates/verify/${targetId}`);
      setResult(response.data);
    } catch (error) {
      setResult(error.response?.data || { valid: false, reason: "not_found" });
    } finally {
      setLoading(false);
    }
  };

  const downloadVerificationLetter = async () => {
    if (!result?.valid) return;
    try {
      setLetterLoading(true);
      const response = await api.get(`/certificates/verification-letter/${result.data.certId}`);
      const { certificate, letterId, issuedAt, statement, organization } = response.data;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`${organization} Verification Letter`, 20, 25);
      doc.setFontSize(12);
      doc.text(`Letter ID: ${letterId}`, 20, 42);
      doc.text(`Issued At: ${new Date(issuedAt).toLocaleString()}`, 20, 57);
      doc.text(`Certificate ID: ${certificate.certId}`, 20, 78);
      doc.text(`Student Name: ${certificate.studentName}`, 20, 93);
      doc.text(`Course Name: ${certificate.courseName}`, 20, 108);
      doc.text(`College: ${certificate.college}`, 20, 123);
      doc.text(`Duration: ${certificate.duration}`, 20, 138);
      doc.text(statement, 20, 165, { maxWidth: 170 });
      doc.save(`${certificate.certId}-verification-letter.pdf`);
    } finally {
      setLetterLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("id")) {
      verifyCertificate(searchParams.get("id"));
    }
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">Certificate Verification</p>
        <h1 className="mt-3 text-4xl font-bold">Verify an InternTech certificate</h1>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input value={certId} onChange={(event) => setCertId(event.target.value)} placeholder="Enter certificate ID" className="flex-1 rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950" />
          <button type="button" onClick={() => verifyCertificate()} className="rounded-2xl bg-blue px-6 py-4 text-sm font-semibold text-white transition hover:bg-navy">
            {loading ? "Verifying..." : "Verify Now"}
          </button>
        </div>

        {result ? (
          <div className={`mt-8 rounded-3xl border p-6 ${result.valid ? "border-success bg-success/10" : "border-danger bg-danger/10"}`}>
            {result.valid ? (
              <>
                <p className="text-lg font-bold text-success">VERIFIED</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                  <p><span className="font-semibold">Student:</span> {result.data.studentName}</p>
                  <p><span className="font-semibold">Course:</span> {result.data.courseName}</p>
                  <p><span className="font-semibold">College:</span> {result.data.college}</p>
                  <p><span className="font-semibold">Certificate ID:</span> {result.data.certId}</p>
                </div>
                <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Authentic and issued by InternTech</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">This certificate record matches the platform verification database.</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
                    <VerifyQRCode certId={result.data.certId} size={80} />
                  </div>
                </div>
                <button type="button" onClick={downloadVerificationLetter} className="mt-6 rounded-2xl bg-blue px-5 py-3 text-sm font-semibold text-white">
                  {letterLoading ? "Preparing Letter..." : "Download Verification Letter PDF"}
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-danger">{result.reason === "revoked" ? "CERTIFICATE REVOKED" : "INVALID CERTIFICATE ID"}</p>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                  {result.reason === "revoked"
                    ? result.revokeReason || "This certificate has been revoked."
                    : "This certificate does not exist in our records."}
                </p>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
