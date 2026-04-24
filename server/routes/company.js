import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { companyName, email, password, location } = req.body;
    db.read();

    const existing = db.data.companies.find((item) => item.email === email?.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "Company already exists" });
    }

    db.data.companies.push({
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
    db.write();

    return res.status(201).json({ message: "Company registration submitted for approval" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register company", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    db.read();
    const company = db.data.companies.find((item) => item.email === email?.toLowerCase());

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

router.get("/jobs", verifyToken, requireRole("company"), (req, res) => {
  try {
    db.read();
    const jobs = db.data.jobs
      .filter((item) => item.companyId === req.user.id)
      .map((job) => ({
        ...job,
        applicantCount: db.data.jobApplications.filter((application) => application.jobId === job.id).length
      }));
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch company jobs", error: error.message });
  }
});

router.get("/stats", verifyToken, requireRole("company"), (req, res) => {
  try {
    db.read();
    const jobs = db.data.jobs.filter((item) => item.companyId === req.user.id);
    const jobIds = jobs.map((item) => item.id);
    const applicants = db.data.jobApplications.filter((item) => jobIds.includes(item.jobId));

    return res.json({
      jobsPosted: jobs.length,
      totalApplicants: applicants.length,
      shortlisted: applicants.filter((item) => item.status === "shortlisted").length,
      pending: applicants.filter((item) => !item.status || item.status === "pending").length
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch company stats", error: error.message });
  }
});

router.get("/applicants", verifyToken, requireRole("company"), (req, res) => {
  try {
    db.read();
    const jobs = db.data.jobs.filter((item) => item.companyId === req.user.id).map((item) => item.id);
    const applicants = db.data.jobApplications
      .filter((item) => jobs.includes(item.jobId))
      .map((application) => {
        const relatedJob = db.data.jobs.find((job) => job.id === application.jobId);
        return {
          ...application,
          appliedAt: application.appliedAt || application.createdAt || new Date().toISOString(),
          jobRole: application.jobRole || relatedJob?.role || "Role unavailable",
          jobLocation: relatedJob?.location || application.location || "Remote"
        };
      })
      .sort((left, right) => new Date(right.appliedAt) - new Date(left.appliedAt));
    return res.json(applicants);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch applicants", error: error.message });
  }
});

router.put("/applicants/:id", verifyToken, requireRole("company"), (req, res) => {
  try {
    db.read();
    const application = db.data.jobApplications.find((item) => item.id === req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const companyJob = db.data.jobs.find(
      (item) => item.id === application.jobId && item.companyId === req.user.id
    );

    if (!companyJob) {
      return res.status(403).json({ message: "You cannot update this application" });
    }

    application.status = req.body.status || application.status;
    application.updatedAt = new Date().toISOString();
    db.write();

    return res.json({ message: "Application updated", application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update applicant status", error: error.message });
  }
});

router.post("/jobs", verifyToken, requireRole("company"), (req, res) => {
  try {
    const { role, location, experience, salary, description } = req.body;
    db.read();
    const company = db.data.companies.find((item) => item.id === req.user.id);
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

    db.data.jobs.push(job);
    db.write();
    return res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    return res.status(500).json({ message: "Failed to post job", error: error.message });
  }
});

export default router;
