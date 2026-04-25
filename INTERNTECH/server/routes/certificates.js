import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { stateModels } from "../models/stateModels.js";
import { requireRole, verifyToken } from "../middleware/auth.js";
import { sendCertificateEmail } from "../utils/emailService.js";
import { generateCertificateId } from "../utils/generators.js";

const router = Router();

router.post("/generate", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { courseId, type = "course" } = req.body;
    const user = await stateModels.users.findOne({ id: req.user.id }).lean();
    const course = await stateModels.courses.findOne({
      $or: [{ id: courseId }, { slug: courseId }]
    }).lean();
    const enrollment = await stateModels.enrollments.findOne({
      studentId: req.user.id,
      courseId: course?.id
    }).lean();

    if (!user || !course || !enrollment) {
      return res.status(404).json({ message: "Eligible course enrollment not found" });
    }

    if (enrollment.progress !== 100) {
      return res.status(400).json({ message: "Complete the course before generating a certificate" });
    }

    const existing = await stateModels.certificates.findOne({
      studentId: req.user.id,
      courseId: course.id,
      status: { $ne: "revoked" }
    }).lean();

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

    await stateModels.certificates.create(certificate);
    await sendCertificateEmail(user.email, user.name, course.title, certificate.certId);

    return res.status(201).json(certificate);
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate certificate", error: error.message });
  }
});

router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const certificates = await stateModels.certificates.find({ studentId: req.user.id }).lean();
    return res.json(certificates);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch certificates", error: error.message });
  }
});

router.get("/verify/:certId", async (req, res) => {
  try {
    const certificate = await stateModels.certificates.findOne({ certId: req.params.certId }).lean();

    await stateModels.verificationLogs.create({
      id: uuidv4(),
      certId: req.params.certId,
      verifiedAt: new Date().toISOString(),
      status: certificate?.status || "not_found"
    });

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

router.get("/verification-letter/:certId", async (req, res) => {
  try {
    const certificate = await stateModels.certificates.findOne({ certId: req.params.certId }).lean();

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    return res.json({
      letterId: `VL-${certificate.certId}`,
      issuedAt: new Date().toISOString(),
      organization: "Interntex",
      statement: "This document confirms that the certificate listed below has been verified against Interntex records.",
      certificate
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch verification letter", error: error.message });
  }
});

router.put("/revoke/:certId", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const certificate = await stateModels.certificates.findOne({ certId: req.params.certId });

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    certificate.status = "revoked";
    certificate.revokeReason = req.body.reason || "Revoked by admin";
    await certificate.save();
    return res.json({ message: "Certificate revoked", certificate });
  } catch (error) {
    return res.status(500).json({ message: "Failed to revoke certificate", error: error.message });
  }
});

export default router;
