import { jsPDF } from "jspdf";
import { getVerifyURL } from "./qrHelper";

// ─── Load images with promise ───
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Logo load failed"));
    img.src = src;
  });
}

// ─── Draw ornamental corner brackets ───
function drawCornerBracket(doc, x, y, size, flipH, flipV) {
  const dH = flipH ? -1 : 1;
  const dV = flipV ? -1 : 1;
  doc.setDrawColor(172, 135, 58);
  doc.setLineWidth(2);
  doc.line(x, y, x + size * dH, y);
  doc.line(x, y, x, y + size * dV);
  doc.setLineWidth(0.8);
  doc.line(x + 5 * dH, y + 5 * dV, x + (size - 8) * dH, y + 5 * dV);
  doc.line(x + 5 * dH, y + 5 * dV, x + 5 * dH, y + (size - 8) * dV);
  doc.setFillColor(172, 135, 58);
  doc.circle(x + 9 * dH, y + 9 * dV, 1.5, "F");
}

// ─── Draw a professional accreditation badge (Same size & High Polish) ───
function drawAccreditationBadge(doc, x, y, size, text, subtext) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;

  // Outer gold ring (Premium)
  doc.setDrawColor(172, 135, 58);
  doc.setLineWidth(1.2);
  doc.circle(cx, cy, r);
  
  // Inner metallic silver ring
  doc.setDrawColor(190, 200, 210);
  doc.setLineWidth(0.5);
  doc.circle(cx, cy, r - 2);

  // Background circle
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, r - 2.5, "F");

  // Center text (Navy)
  doc.setTextColor(7, 15, 43);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size > 30 ? 7 : 6);
  doc.text(text, cx, cy, { align: "center" });

  // Subtext (Gold)
  doc.setTextColor(172, 135, 58);
  doc.setFontSize(size > 30 ? 4 : 3);
  doc.text(subtext, cx, cy + 6, { align: "center" });

  // Circular accent dots
  doc.setFillColor(172, 135, 58);
  const dots = 12;
  for (let i = 0; i < dots; i++) {
    const angle = (i / dots) * Math.PI * 2;
    doc.circle(cx + Math.cos(angle) * (r - 4.5), cy + Math.sin(angle) * (r - 4.5), 0.5, "F");
  }
}

// ─── Divider with center diamond ───
function drawDivider(doc, x1, x2, y) {
  const mid = (x1 + x2) / 2;
  doc.setDrawColor(172, 135, 58);
  doc.setLineWidth(1);
  doc.line(x1, y, mid - 12, y);
  doc.line(mid + 12, y, x2, y);
  const d = 4;
  doc.setFillColor(172, 135, 58);
  doc.line(mid, y - d, mid + d, y);
  doc.line(mid + d, y, mid, y + d);
  doc.line(mid, y + d, mid - d, y);
  doc.line(mid - d, y, mid, y - d);
  doc.setLineWidth(0.3);
  doc.line(x1 + 10, y - 3, mid - 16, y - 3);
  doc.line(x1 + 10, y + 3, mid - 16, y + 3);
  doc.line(mid + 16, y - 3, x2 - 10, y - 3);
  doc.line(mid + 16, y + 3, x2 - 10, y + 3);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN — University-Grade Certificate Generator
// ═══════════════════════════════════════════════════════════════════
export async function generateCertificatePDF(certData) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = 842, H = 595, cx = W / 2;
  const certId = certData.certId || "INT-XXXX-0000";
  const completionDate = new Date(certData.completionDate || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric"
  });
  const verifyUrl = getVerifyURL(certId);

  // Load images
  let logoImg = null, qrImg = null, aicteImg = null, ugcImg = null, msmeImg = null;
  let rakeshImg = null, pritiImg = null;
  try { logoImg = await loadImage("/interntex-logo.png"); } catch (_) { /* ignore */ }
  try { 
    qrImg = await loadImage(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}&margin=1`); 
  } catch (_) { /* ignore */ }
  
  // Try to load real accreditation logos
  try { aicteImg = await loadImage("/aicte.png"); } catch (_) { /* fallback */ }
  try { ugcImg = await loadImage("/ugc.png"); } catch (_) { /* fallback */ }
  try { msmeImg = await loadImage("/msme.png"); } catch (_) { /* fallback */ }
  try { rakeshImg = await loadImage("/rakesh_sign.png"); } catch (_) { /* fallback */ }
  try { pritiImg = await loadImage("/priti_sign.png"); } catch (_) { /* fallback */ }

  // 1. Background
  doc.setFillColor(7, 15, 43);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(253, 250, 240);
  doc.roundedRect(22, 22, W - 44, H - 44, 4, 4, "F");

  // 2. Borders
  doc.setDrawColor(172, 135, 58);
  doc.setLineWidth(3.5);
  doc.roundedRect(22, 22, W - 44, H - 44, 4, 4);
  doc.setLineWidth(1.2);
  doc.roundedRect(30, 30, W - 60, H - 60, 3, 3);
  doc.setDrawColor(200, 170, 90);
  doc.setLineWidth(0.5);
  doc.roundedRect(36, 36, W - 72, H - 72, 2, 2);

  // 3. Corner Brackets
  const cs = 40, co = 40;
  drawCornerBracket(doc, co, co, cs, false, false);
  drawCornerBracket(doc, W - co, co, cs, true, false);
  drawCornerBracket(doc, co, H - co, cs, false, true);
  drawCornerBracket(doc, W - co, H - co, cs, true, true);

  // 4. Watermark
  doc.setGState(new doc.GState({ opacity: 0.03 }));
  doc.setFont("times", "bolditalic");
  doc.setFontSize(90);
  doc.setTextColor(130, 110, 60);
  doc.text("INTERNTEX", cx, H / 2 + 10, { align: "center", angle: 28 });
  doc.setGState(new doc.GState({ opacity: 1 }));

  // 5. Upper Right QR Code
  if (qrImg) {
    const qrSize = 46, qrX = W - 90, qrY = 86;
    doc.setDrawColor(172, 135, 58);
    doc.setLineWidth(1);
    doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2);
    doc.addImage(qrImg, "PNG", qrX, qrY, qrSize, qrSize);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.setTextColor(172, 135, 58);
    doc.text("VERIFY", qrX + qrSize / 2, qrY + qrSize + 7, { align: "center" });
  }

  // 6. Header
  let cursorY = 62;
  if (logoImg) {
    const logoW = 160;
    const logoH = 60;
    doc.addImage(logoImg, "PNG", cx - (logoW / 2), cursorY, logoW, logoH);
    cursorY += logoH + 6;
  } else {
    doc.setTextColor(7, 15, 43);
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text("INTERNTEX", cx, cursorY + 15, { align: "center" });
    cursorY += 28;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(130, 120, 100);
  doc.text("AN INITIATIVE TOWARDS SKILL DEVELOPMENT & PROFESSIONAL EXCELLENCE", cx, cursorY, { align: "center" });
  cursorY += 11;
  doc.setFontSize(6.5);
  doc.setTextColor(150, 140, 120);
  doc.text("RECOGNIZED  •  INDUSTRY AFFILIATED  •  GOVERNMENT CERTIFIED", cx, cursorY, { align: "center" });
  cursorY += 12;

  // 7. Content
  drawDivider(doc, 140, W - 140, cursorY);
  cursorY += 20;
  doc.setFillColor(7, 15, 43);
  doc.roundedRect(cx - 195, cursorY - 14, 390, 34, 4, 4, "F");
  doc.setTextColor(172, 135, 58);
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text("CERTIFICATE OF EXCELLENCE", cx, cursorY + 8, { align: "center" });
  cursorY += 30;
  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 90);
  doc.text("Awarded in Recognition of Outstanding Achievement & Professional Competence", cx, cursorY, { align: "center" });
  cursorY += 20;
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(80, 75, 65);
  doc.text("This is to certify that", cx, cursorY, { align: "center" });
  cursorY += 28;
  const studentName = (certData.studentName || "Student Name").toUpperCase();
  doc.setFont("times", "bolditalic");
  doc.setFontSize(34);
  doc.setTextColor(140, 95, 15);
  doc.text(studentName, cx, cursorY, { align: "center" });
  const nw = doc.getTextWidth(studentName);
  doc.setDrawColor(172, 135, 58);
  doc.setLineWidth(1.2);
  doc.line(cx - nw / 2 - 15, cursorY + 7, cx + nw / 2 + 15, cursorY + 7);
  doc.setLineWidth(0.4);
  doc.line(cx - nw / 2 - 5, cursorY + 11, cx + nw / 2 + 5, cursorY + 11);
  cursorY += 26;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 50, 45);
  doc.text("has demonstrated exemplary dedication, intellectual rigor, and professional excellence", cx, cursorY, { align: "center" });
  cursorY += 14;
  doc.text("during the successful completion of the certified training program in", cx, cursorY, { align: "center" });
  cursorY += 20;
  const courseName = (certData.courseName || "Program Name").toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(7, 15, 43);
  doc.text(courseName, cx, cursorY, { align: "center" });
  const cw = doc.getTextWidth(courseName);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(2);
  doc.line(cx - cw / 2, cursorY + 5, cx + cw / 2, cursorY + 5);
  cursorY += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 85, 75);
  const col1X = 140, col2X = cx, col3X = W - 140;
  doc.setFont("helvetica", "bold");
  doc.text("Duration:", col1X, cursorY);
  doc.setFont("helvetica", "normal");
  doc.text(certData.duration || "N/A", col1X + 48, cursorY);
  doc.setFont("helvetica", "bold");
  doc.text("Date of Issue:", col2X - 38, cursorY);
  doc.setFont("helvetica", "normal");
  doc.text(completionDate, col2X + 30, cursorY);
  doc.setFont("helvetica", "bold");
  doc.text("Certificate No:", col3X - 60, cursorY);
  doc.setFont("helvetica", "normal");
  doc.text(certId, col3X + 10, cursorY);
  cursorY += 14;
  if (certData.college && certData.college !== "N/A") {
    doc.setFont("helvetica", "bold");
    doc.text("Institution:", col1X, cursorY);
    doc.setFont("helvetica", "normal");
    doc.text(certData.college, col1X + 55, cursorY);
    cursorY += 14;
  }
  drawDivider(doc, 140, W - 140, cursorY);
  cursorY += 18;
  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 75, 65);
  doc.text("This accomplishment reflects the candidate's remarkable ability to learn, adapt, and excel in a demanding", cx, cursorY, { align: "center" });
  doc.text("professional environment. The knowledge and skills acquired shall serve as a strong foundation for future endeavors.", cx, cursorY + 12, { align: "center" });
  cursorY += 28;

  // 8. Signatures & Badges
  const sigY = cursorY + 22, leftX = 170, rightX = W - 170, sigLineW = 130;
  
  // Left: Er. Rakesh
  if (rakeshImg) {
    doc.addImage(rakeshImg, "PNG", leftX - 45, sigY - 35, 90, 32);
  } else {
    doc.setDrawColor(172, 135, 58);
    doc.setLineWidth(0.4);
    doc.line(leftX - 30, sigY - 12, leftX + 40, sigY - 6);
  }
  doc.setDrawColor(7, 15, 43);
  doc.setLineWidth(0.8);
  doc.line(leftX - sigLineW / 2, sigY, leftX + sigLineW / 2, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Er. Rakesh", leftX, sigY + 14, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 95, 85);
  doc.text("Co-Founder & CEO", leftX, sigY + 25, { align: "center" });
  doc.text("Interntex Academy", leftX, sigY + 35, { align: "center" });

  // Center: 2 Accreditation Badges (AICTE & UGC)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(120, 115, 105);
  doc.text("ACCREDITED & RECOGNIZED BY", cx, sigY - 10, { align: "center" });
  const bSize = 46, bY = sigY - 2, spacing = 85; // Increased size and adjusted alignment
  
  // AICTE (Left of center)
  const aicteX = cx - (spacing / 2) - (bSize / 2);
  if (aicteImg) {
    doc.addImage(aicteImg, "PNG", aicteX, bY, bSize, bSize);
  } else {
    drawAccreditationBadge(doc, aicteX, bY, bSize, "AICTE", "APPROVED");
  }

  // UGC (Right of center)
  const ugcX = cx + (spacing / 2) - (bSize / 2);
  if (ugcImg) {
    doc.addImage(ugcImg, "PNG", ugcX, bY, bSize, bSize);
  } else {
    drawAccreditationBadge(doc, ugcX, bY, bSize, "UGC", "RECOGNIZED");
  }

  // Right: Priti Yadav
  if (pritiImg) {
    doc.addImage(pritiImg, "PNG", rightX - 45, sigY - 35, 90, 32);
  } else {
    doc.setDrawColor(172, 135, 58);
    doc.setLineWidth(0.4);
    doc.line(rightX - 35, sigY - 10, rightX + 35, sigY - 5);
  }
  doc.setDrawColor(7, 15, 43);
  doc.setLineWidth(0.8);
  doc.line(rightX - sigLineW / 2, sigY, rightX + sigLineW / 2, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Priti Yadav", rightX, sigY + 14, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 95, 85);
  doc.text("Training Head", rightX, sigY + 25, { align: "center" });
  doc.text("Interntex Academy", rightX, sigY + 35, { align: "center" });

  // 9. Footer Bar
  const barY = H - 52;
  doc.setFillColor(7, 15, 43);
  doc.roundedRect(80, barY, W - 160, 24, 12, 12, "F");
  doc.setDrawColor(172, 135, 58);
  doc.setLineWidth(0.5);
  doc.roundedRect(82, barY + 2, W - 164, 20, 10, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(172, 135, 58);
  doc.text("VERIFY ONLINE", 155, barY + 15, { align: "center" });
  doc.setFont("courier", "normal");
  doc.setFontSize(6);
  doc.setTextColor(200, 200, 210);
  doc.text(verifyUrl, cx, barY + 15, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(172, 135, 58);
  doc.text(`CERT ID: ${certId}`, W - 155, barY + 15, { align: "center" });

  // 10. Security Line
  doc.setGState(new doc.GState({ opacity: 0.06 }));
  doc.setFont("courier", "normal");
  doc.setFontSize(3);
  doc.setTextColor(100, 80, 40);
  const micro = `INTERNTEX-VERIFIED-${certId}-AUTHENTIC-`;
  doc.text(micro.repeat(4), cx, H - 34, { align: "center" });
  doc.setGState(new doc.GState({ opacity: 1 }));

  return doc;
}
