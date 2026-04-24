import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { generateCertificatePDF } from "../../utils/generateCertificate";
import { VerifyQRCode } from "../../utils/qrHelper";

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [preview, setPreview] = useState(null);

  const downloadCertificate = (certificate) => {
    try {
      const doc = generateCertificatePDF(certificate);
      doc.save(`${certificate.certId}.pdf`);
    } catch (_error) {
      toast.error("Failed to generate certificate PDF");
    }
  };

  const copyVerifyLink = async (certificate) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/verify?id=${certificate.certId}`);
      toast.success("Verify link copied");
    } catch (_error) {
      toast.error("Copy failed");
    }
  };

  const shareOnLinkedIn = (certificate) => {
    const text = `I just completed ${certificate.courseName} on InternTech. Certificate ID: ${certificate.certId}`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        `${window.location.origin}/verify?id=${certificate.certId}`
      )}&summary=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const response = await api.get("/certificates/my");
        setCertificates(response.data || []);
      } catch (_error) {
        setCertificates([]);
      }
    };

    loadCertificates();
  }, []);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-3xl font-bold">My Certificates</h1>
      {!certificates.length ? (
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
          No certificates yet. Complete a course and pass its assessment to generate one.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {certificates.map((certificate) => (
            <div
              key={certificate.certId}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
            >
              <h2 className="text-xl font-bold">{certificate.courseName}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Certificate ID: {certificate.certId}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Issued: {new Date(certificate.completionDate).toLocaleDateString("en-IN")}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setPreview(certificate)}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => downloadCertificate(certificate)}
                  className="rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white"
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => copyVerifyLink(certificate)}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700"
                >
                  Copy Verify Link
                </button>
                <button
                  type="button"
                  onClick={() => shareOnLinkedIn(certificate)}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700"
                >
                  LinkedIn Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-4xl rounded-[32px] bg-white p-8 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue">
                  Certificate Preview
                </p>
                <h2 className="mt-2 text-3xl font-bold">{preview.courseName}</h2>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700"
              >
                Close
              </button>
            </div>
            <div className="mt-8 rounded-[30px] border-[5px] border-gold bg-[linear-gradient(180deg,#fffdf8_0%,#f7f2e8_100%)] p-8 text-center text-slate-900 shadow-[inset_0_0_0_1px_rgba(201,164,92,0.35)]">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-slate-500">
                <span>InternTech</span>
                <span>Verified Credential</span>
              </div>
              <div className="mt-6 border-y border-gold/40 py-6">
                <p className="font-certificate text-4xl font-bold text-navy">Certificate of Completion</p>
                <p className="mt-3 text-xs uppercase tracking-[0.32em] text-slate-500">Presented To</p>
                <p className="mt-4 font-certificate text-5xl font-bold text-gold">{preview.studentName}</p>
                <p className="mt-4 text-slate-600">for successfully completing the training in</p>
                <p className="mt-3 text-2xl font-bold text-blue">{preview.courseName}</p>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-slate-500 md:grid-cols-3">
                <p>ID: {preview.certId}</p>
                <p>Duration: {preview.duration}</p>
                <p>Date: {new Date(preview.completionDate).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="mt-8 flex flex-col items-center gap-3">
                <VerifyQRCode certId={preview.certId} size={84} />
                <code className="rounded-xl bg-slate-100 px-3 py-2 text-xs dark:bg-slate-900">
                  {`<a href="${window.location.origin}/verify?id=${preview.certId}">Verify ${preview.courseName}</a>`}
                </code>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
