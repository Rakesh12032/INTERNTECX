import { jsPDF } from "jspdf";
import { getVerifyURL } from "./qrHelper";

export function generateCertificatePDF(certData) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4"
  });

  const W = 842;
  const H = 595;
  const cx = W / 2;
  const completionDate = new Date(certData.completionDate || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const verifyUrl = getVerifyURL(certData.certId || "INT-XXXX-0000");
  const certId = certData.certId || "INT-XXXX-0000";

  // ── Background ──
  doc.setFillColor(7, 15, 43); // Deep navy
  doc.rect(0, 0, W, H, "F");

  // Inner cream area
  doc.setFillColor(255, 252, 245);
  doc.roundedRect(30, 30, W - 60, H - 60, 6, 6, "F");

  // ── Outer Gold Border ──
  doc.setDrawColor(186, 149, 68);
  doc.setLineWidth(3);
  doc.roundedRect(30, 30, W - 60, H - 60, 6, 6);

  // ── Inner Gold Decorative Border ──
  doc.setDrawColor(210, 175, 100);
  doc.setLineWidth(1);
  doc.roundedRect(44, 44, W - 88, H - 88, 4, 4);

  // ── Thin inner accent line ──
  doc.setDrawColor(230, 200, 130);
  doc.setLineWidth(0.5);
  doc.roundedRect(50, 50, W - 100, H - 100, 3, 3);

  // ── Corner Ornaments (L-shaped gold accents) ──
  const cornerSize = 36;
  const corners = [
    [54, 54],                         // top-left
    [W - 54 - cornerSize, 54],        // top-right
    [54, H - 54 - cornerSize],        // bottom-left
    [W - 54 - cornerSize, H - 54 - cornerSize] // bottom-right
  ];
  doc.setDrawColor(186, 149, 68);
  doc.setLineWidth(2.5);
  corners.forEach(([x, y], i) => {
    if (i === 0) { doc.line(x, y, x + cornerSize, y); doc.line(x, y, x, y + cornerSize); }
    if (i === 1) { doc.line(x + cornerSize, y, x, y); doc.line(x + cornerSize, y, x + cornerSize, y + cornerSize); }
    if (i === 2) { doc.line(x, y + cornerSize, x + cornerSize, y + cornerSize); doc.line(x, y, x, y + cornerSize); }
    if (i === 3) { doc.line(x + cornerSize, y + cornerSize, x, y + cornerSize); doc.line(x + cornerSize, y, x + cornerSize, y + cornerSize); }
  });

  // ── Top Navy Ribbon ──
  doc.setFillColor(7, 15, 43);
  doc.roundedRect(cx - 180, 60, 360, 46, 23, 23, "F");

  doc.setTextColor(186, 149, 68);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Interntex", cx, 80, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text("LEARN  •  INTERN  •  SUCCEED", cx, 96, { align: "center" });

  // ── Decorative gold line under ribbon ──
  doc.setDrawColor(186, 149, 68);
  doc.setLineWidth(1.5);
  doc.line(cx - 160, 116, cx + 160, 116);
  doc.setLineWidth(0.5);
  doc.line(cx - 120, 121, cx + 120, 121);

  // ── Certificate Title ──
  doc.setTextColor(7, 15, 43);
  doc.setFont("times", "bold");
  doc.setFontSize(36);
  doc.text("Certificate of Excellence", cx, 158, { align: "center" });

  // ── Small decorative divider ──
  doc.setDrawColor(186, 149, 68);
  doc.setLineWidth(1);
  doc.line(cx - 80, 168, cx - 20, 168);
  doc.setFillColor(186, 149, 68);
  doc.circle(cx, 168, 3, "F");
  doc.line(cx + 20, 168, cx + 80, 168);

  // ── "This is to certify that" ──
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text("This certificate is proudly presented to", cx, 194, { align: "center" });

  // ── Student Name (Gold) ──
  doc.setFont("times", "bolditalic");
  doc.setFontSize(40);
  doc.setTextColor(165, 120, 30);
  doc.text(certData.studentName || "Student Name", cx, 238, { align: "center" });

  // ── Gold underline below name ──
  const nameWidth = doc.getTextWidth(certData.studentName || "Student Name");
  doc.setDrawColor(186, 149, 68);
  doc.setLineWidth(1);
  doc.line(cx - nameWidth / 2 - 10, 246, cx + nameWidth / 2 + 10, 246);

  // ── Description Paragraph ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 70);
  const descLine1 = "has demonstrated exceptional dedication, outstanding performance, and a strong";
  const descLine2 = "commitment to professional growth by successfully completing the program";
  doc.text(descLine1, cx, 270, { align: "center" });
  doc.text(descLine2, cx, 286, { align: "center" });

  // ── Course Name ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(7, 15, 43);
  doc.text(certData.courseName || "Course Name", cx, 322, { align: "center" });

  // ── Course underline ──
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(2);
  const courseWidth = doc.getTextWidth(certData.courseName || "Course Name");
  doc.line(cx - courseWidth / 2, 330, cx + courseWidth / 2, 330);

  // ── Details Row ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 110);
  const detailY = 358;
  doc.text(`Duration: ${certData.duration || "N/A"}`, 170, detailY);
  doc.text(`Date: ${completionDate}`, cx, detailY, { align: "center" });
  doc.text(`ID: ${certId}`, W - 170, detailY, { align: "right" });

  // ── Thin separator ──
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(100, 374, W - 100, 374);

  // ── Appreciation Text ──
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 90);
  const appreciationText = "This accomplishment reflects the candidate's remarkable ability to learn, adapt, and excel. We are confident";
  const appreciationText2 = "that their skills and determination will lead to a successful and impactful career ahead.";
  doc.text(appreciationText, cx, 394, { align: "center" });
  doc.text(appreciationText2, cx, 408, { align: "center" });

  // ═══════════════════════════════════════════
  // ── SIGNATURE SECTION ──
  // ═══════════════════════════════════════════

  const sigY = 470;

  // ── Left: Co-Founder (Er. Rakesh) ──
  doc.setDrawColor(7, 15, 43);
  doc.setLineWidth(1);
  doc.line(110, sigY, 280, sigY);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(7, 15, 43);
  doc.text("Er. Rakesh", 195, sigY + 18, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 110);
  doc.text("Co-Founder & CEO", 195, sigY + 32, { align: "center" });
  doc.text("Interntex", 195, sigY + 44, { align: "center" });

  // ── Center: Official Seal ──
  // Outer ring
  doc.setFillColor(7, 15, 43);
  doc.circle(cx, sigY + 6, 46, "F");
  // Inner ring
  doc.setFillColor(186, 149, 68);
  doc.circle(cx, sigY + 6, 38, "F");
  // Core
  doc.setFillColor(7, 15, 43);
  doc.circle(cx, sigY + 6, 30, "F");

  doc.setTextColor(186, 149, 68);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("VERIFIED", cx, sigY - 6, { align: "center" });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text("OFFICIAL", cx, sigY + 7, { align: "center" });
  doc.setFontSize(9);
  doc.text("SEAL", cx, sigY + 20, { align: "center" });

  // Ring text simulation
  doc.setFontSize(6);
  doc.setTextColor(7, 15, 43);
  doc.text("★ Interntex ★ CERTIFIED ★", cx, sigY - 34, { align: "center" });
  doc.text("★ EXCELLENCE ★ AWARD ★", cx, sigY + 48, { align: "center" });

  // ── Right: Training Head (Priti Yadav) ──
  doc.setDrawColor(7, 15, 43);
  doc.setLineWidth(1);
  doc.line(W - 280, sigY, W - 110, sigY);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(7, 15, 43);
  doc.text("Priti Yadav", W - 195, sigY + 18, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 110);
  doc.text("Training Head", W - 195, sigY + 32, { align: "center" });
  doc.text("Interntex", W - 195, sigY + 44, { align: "center" });

  // ── Bottom Navy Bar ──
  doc.setFillColor(7, 15, 43);
  doc.roundedRect(80, H - 65, W - 160, 28, 14, 14, "F");

  doc.setTextColor(186, 149, 68);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("VERIFY ONLINE", 180, H - 47, { align: "center" });

  doc.setTextColor(200, 200, 210);
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text(verifyUrl, cx, H - 47, { align: "center" });

  doc.setTextColor(186, 149, 68);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`ID: ${certId}`, W - 180, H - 47, { align: "center" });

  return doc;
}
