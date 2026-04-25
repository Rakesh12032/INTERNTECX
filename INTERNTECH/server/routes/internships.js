import multer from "multer";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { stateModels } from "../models/stateModels.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

import { cloudinaryStorage } from "../utils/cloudinary.js";

const router = Router();
const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get("/", async (_req, res) => {
  try {
    const internships = await stateModels.internships.find({}).lean();
    return res.json(internships);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch internships", error: error.message });
  }
});

router.post("/apply", verifyToken, requireRole("student"), upload.single("resumeFile"), async (req, res) => {
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

    const track = await stateModels.internships.findOne({
      $or: [{ id: trackId }, { slug: trackId }]
    }).lean();

    if (!track) {
      return res.status(404).json({ message: "Internship track not found" });
    }

    const existingApplication = await stateModels.internshipApplications.findOne({
      studentId: req.user.id,
      trackId: track.id
    }).lean();

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
      resumeUrl: req.file?.path || null,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    await stateModels.internshipApplications.create(application);

    return res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit application", error: error.message });
  }
});

export default router;
