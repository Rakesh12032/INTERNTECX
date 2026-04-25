import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { stateModels } from "../models/stateModels.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { companyName, email, password, location } = req.body;
    const existing = await stateModels.companies.findOne({ email: email?.toLowerCase() }).lean();
    if (existing) {
      return res.status(409).json({ message: "Company already exists" });
    }

    await stateModels.companies.create({
      id: uuidv4(),
      companyName,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password || "Company@123", 12),
      role: "company",
      location,
      status: "pending",
      jobs: [],
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({ message: "Company registration submitted for approval" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register company", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await stateModels.companies.findOne({ email: email?.toLowerCase() }).lean();

    if (!company) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password || "", company.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (company.status !== "approved") {
      return res.status(403).json({ message: "Company is not approved yet" });
    }

    const token = jwt.sign(
      { id: company.id, email: company.email, role: "company", name: company.companyName },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: company.id,
        name: company.companyName,
        email: company.email,
        role: "company",
        location: company.location
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Company login failed", error: error.message });
  }
});

router.get("/jobs", verifyToken, requireRole("company"), async (req, res) => {
  try {
    const jobs = await stateModels.jobs.find({ companyId: req.user.id }).lean();
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch company jobs", error: error.message });
  }
});

router.get("/applicants", verifyToken, requireRole("company"), async (req, res) => {
  try {
    const jobs = await stateModels.jobs.find({ companyId: req.user.id }).lean();
    const jobIds = jobs.map((item) => item.id);
    const applicants = await stateModels.jobApplications.find({ jobId: { $in: jobIds } }).lean();
    return res.json(applicants);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch applicants", error: error.message });
  }
});

router.put("/applicants/:id", verifyToken, requireRole("company"), async (req, res) => {
  try {
    const application = await stateModels.jobApplications.findOne({ id: req.params.id });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const companyJob = await stateModels.jobs.findOne({
      id: application.jobId,
      companyId: req.user.id
    }).lean();

    if (!companyJob) {
      return res.status(403).json({ message: "You cannot update this application" });
    }

    application.status = req.body.status || application.status;
    application.updatedAt = new Date().toISOString();
    await application.save();

    return res.json({ message: "Application updated", application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update applicant status", error: error.message });
  }
});

router.post("/jobs", verifyToken, requireRole("company"), async (req, res) => {
  try {
    const { role, location, experience, salary, description } = req.body;
    const company = await stateModels.companies.findOne({ id: req.user.id }).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const job = {
      id: uuidv4(),
      companyId: company.id,
      company: company.companyName,
      role,
      location,
      experience,
      salary,
      description,
      verified: true,
      type: "Full Time",
      postedAt: new Date().toISOString(),
      skills: []
    };

    await stateModels.jobs.create(job);
    return res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    return res.status(500).json({ message: "Failed to post job", error: error.message });
  }
});

export default router;
