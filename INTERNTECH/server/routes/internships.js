import multer from "multer";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get("/", (_req, res) => {
  try {
    db.read();
    return res.json(db.data.internships);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch internships", error: error.message });
  }
});

router.post("/apply", verifyToken, requireRole("student"), upload.single("resumeFile"), (req, res) => {
  try {
    const {
      trackId,
      name,
      email,
      phone,
      college,
      branch,
      year,
      linkedin,
      github,
      whyYou
    } = req.body;

    db.read();
    const track = db.data.internships.find((item) => item.id === trackId || item.slug === trackId);

    if (!track) {
      return res.status(404).json({ message: "Internship track not found" });
    }

    const existingApplication = db.data.internshipApplications.find(
      (item) => item.studentId === req.user.id && item.trackId === track.id
    );

    if (existingApplication) {
      return res.status(409).json({ message: "You have already applied to this internship track" });
    }

    const application = {
      id: uuidv4(),
      studentId: req.user.id,
      trackId: track.id,
      trackName: track.title,
      name,
      email,
      phone,
      college,
      branch,
      year,
      linkedin,
      github,
      whyYou,
      resumeFileName: req.file?.originalname || null,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    db.data.internshipApplications.push(application);
    db.write();

    return res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit application", error: error.message });
  }
});

export default router;
