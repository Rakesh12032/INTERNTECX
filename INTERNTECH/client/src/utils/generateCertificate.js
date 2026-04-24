import { jsPDF } from "jspdf";
import { getVerifyURL } from "./qrHelper";

export function generateCertificatePDF(certData) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4"
  });

  const completionDate = new Date(certData.completionDate || Date.now()).toLocaleDateString();
  const verifyUrl = getVerifyURL(certData.certId || "INT-XXXX-0000");

  doc.setFillColor(252, 250, 245);
  doc.rect(0, 0, 842, 595, "F");

  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(8);
  doc.rect(24, 24, 794, 547);

  doc.setDrawColor(201, 164, 92);
  doc.setLineWidth(1.5);
  doc.rect(42, 42, 758, 511);

  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("InternTech", 421, 86, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text("LEARN. INTERN. SUCCEED.", 421, 108, { align: "center" });

  doc.setTextColor(10, 22, 40);
  doc.setFont("times", "bold");
  doc.setFontSize(32);
  doc.text("Certificate of Completion", 421, 160, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor(71, 85, 105);
  doc.text("This is to certify that", 421, 198, { align: "center" });

  doc.setTextColor(245, 158, 11);
  doc.setFont("times", "bold");
  doc.setFontSize(36);
  doc.text(certData.studentName || "Student Name", 421, 246, { align: "center" });

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text("has successfully completed", 421, 282, { align: "center" });

  doc.setTextColor(37, 99, 235);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(certData.courseName || "Course Name", 421, 320, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(14);
  doc.text(`Duration: ${certData.duration || "N/A"}`, 200, 384);
  doc.text(`Completion Date: ${completionDate}`, 200, 408);
  doc.text(`Certificate ID: ${certData.certId || "INT-XXXX-0000"}`, 200, 432);

  doc.setDrawColor(10, 22, 40);
  doc.line(110, 500, 270, 500);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Director, InternTech", 110, 520);

  doc.setFillColor(245, 158, 11);
  doc.circle(700, 470, 48, "FD");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("OFFICIAL", 700, 465, { align: "center" });
  doc.text("SEAL", 700, 482, { align: "center" });

  doc.setTextColor(10, 22, 40);
  doc.setDrawColor(37, 99, 235);
  doc.roundedRect(560, 370, 185, 68, 12, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Verify Certificate Online", 652, 392, { align: "center" });
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.text(verifyUrl, 652, 414, { align: "center", maxWidth: 160 });
  doc.setFont("helvetica", "normal");
  doc.text("Scan QR / open verification link", 652, 430, { align: "center" });

  return doc;
}
