import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { requireRole, verifyToken } from "../middleware/auth.js";
import { sendCertificateEmail } from "../utils/emailService.js";
import { generateCertificateId } from "../utils/generators.js";

const router = Router();

router.post("/generate", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { courseId, type = "course" } = req.body;
    db.read();

    const user = db.data.users.find((item) => item.id === req.user.id);
    const course = db.data.courses.find((item) => item.id === courseId || item.slug === courseId);
    const enrollment = db.data.enrollments.find((item) => item.studentId === req.user.id && item.courseId === course?.id);

    if (!user || !course || !enrollment) {
      return res.status(404).json({ message: "Eligible course enrollment not found" });
    }

    if (enrollment.progress !== 100) {
      return res.status(400).json({ message: "Complete the course before generating a certificate" });
    }

    const existing = db.data.certificates.find(
      (item) => item.studentId === req.user.id && item.courseId === course.id && item.status !== "revoked"
    );

    if (existing) {
      return res.json(existing);
    }

    const certificate = {
      id: uuidv4(),
      certId: generateCertificateId(),
      studentId: user.id,
      studentName: user.name,
      college: user.college,
      courseId: course.id,
      courseName: course.title,
      completionDate: new Date().toISOString(),
      duration: course.duration,
      type,
      status: "active"
    };

    db.data.certificates.push(certificate);
    db.write();
    await sendCertificateEmail(user.email, user.name, course.title, certificate.certId);

    return res.status(201).json(certificate);
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate certificate", error: error.message });
  }
});

router.get("/my", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const certificates = db.data.certificates.filter((item) => item.studentId === req.user.id);
    return res.json(certificates);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch certificates", error: error.message });
  }
});

router.get("/verify/:certId", (req, res) => {
  try {
    db.read();
    const certificate = db.data.certificates.find((item) => item.certId === req.params.certId);

    db.data.verificationLogs.push({
      id: uuidv4(),
      certId: req.params.certId,
      verifiedAt: new Date().toISOString(),
      status: certificate?.status || "not_found"
    });
    db.write();

    if (!certificate) {
      return res.status(404).json({ valid: false, reason: "not_found" });
    }

    if (certificate.status === "revoked") {
      return res.json({ valid: false, reason: "revoked", revokeReason: certificate.revokeReason || "Administrative action" });
    }

    return res.json({ valid: true, data: certificate });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify certificate", error: error.message });
  }
});

router.get("/verification-letter/:certId", (req, res) => {
  try {
    db.read();
    const certificate = db.data.certificates.find((item) => item.certId === req.params.certId);

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    return res.json({
      letterId: `VL-${certificate.certId}`,
      issuedAt: new Date().toISOString(),
      organization: "InternTech",
      signedBy: "Director, InternTech Learning Programs",
      supportEmail: "support@interntech.in",
      statement: "This document confirms that the certificate listed below has been verified against InternTech records.",
      certificate
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch verification letter", error: error.message });
  }
});

router.put("/revoke/:certId", verifyToken, requireRole("admin"), (req, res) => {
  try {
    db.read();
    const certificate = db.data.certificates.find((item) => item.certId === req.params.certId);

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    certificate.status = "revoked";
    certificate.revokeReason = req.body.reason || "Revoked by admin";
    db.write();
    return res.json({ message: "Certificate revoked", certificate });
  } catch (error) {
    return res.status(500).json({ message: "Failed to revoke certificate", error: error.message });
  }
});

export default router;
