import { jsPDF } from "jspdf";
import { getVerifyURL } from "./qrHelper";

export function generateCertificatePDF(certData) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4"
  });

  const completionDate = new Date(certData.completionDate || Date.now()).toLocaleDateString("en-IN");
  const verifyUrl = getVerifyURL(certData.certId || "INT-XXXX-0000");

  doc.setFillColor(249, 247, 241);
  doc.rect(0, 0, 842, 595, "F");

  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, 842, 54, "F");
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 54, 842, 8, "F");

  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(9);
  doc.rect(26, 26, 790, 543);

  doc.setDrawColor(193, 154, 66);
  doc.setLineWidth(1.6);
  doc.rect(44, 44, 754, 507);

  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("InternTech", 421, 96, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text("LEARN. INTERN. SUCCEED.", 421, 115, { align: "center" });

  doc.setTextColor(214, 222, 233);
  doc.setFont("times", "bolditalic");
  doc.setFontSize(72);
  doc.text("INTER NTECH", 421, 300, {
    align: "center",
    angle: 0
  });

  doc.setTextColor(10, 22, 40);
  doc.setFont("times", "bold");
  doc.setFontSize(34);
  doc.text("Certificate of Completion", 421, 172, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor(71, 85, 105);
  doc.text("This is to proudly certify that", 421, 210, { align: "center" });

  doc.setTextColor(245, 158, 11);
  doc.setFont("times", "bold");
  doc.setFontSize(39);
  doc.text(certData.studentName || "Student Name", 421, 260, { align: "center" });

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text("has successfully completed the professional training in", 421, 296, {
    align: "center"
  });

  doc.setTextColor(37, 99, 235);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.text(certData.courseName || "Course Name", 421, 334, { align: "center" });

  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(`Duration: ${certData.duration || "N/A"}`, 158, 390);
  doc.text(`Completion Date: ${completionDate}`, 158, 414);
  doc.text(`Certificate ID: ${certData.certId || "INT-XXXX-0000"}`, 158, 438);

  doc.setDrawColor(10, 22, 40);
  doc.line(112, 500, 280, 500);
  doc.setFont("times", "italic");
  doc.setFontSize(20);
  doc.text("A. Sharma", 194, 486, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Program Director, InternTech", 112, 520);

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1.2);
  doc.roundedRect(546, 372, 210, 86, 14, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(10, 22, 40);
  doc.text("Verify Certificate", 651, 394, { align: "center" });
  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.text(verifyUrl, 651, 416, { align: "center", maxWidth: 180 });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Use the link above to confirm authenticity.", 651, 438, { align: "center" });

  doc.setFillColor(245, 158, 11);
  doc.circle(698, 492, 50, "FD");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("OFFICIAL", 698, 485, { align: "center" });
  doc.text("SEAL", 698, 502, { align: "center" });

  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("InternTech Professional Certificate", 421, 544, { align: "center" });

  return doc;
}
