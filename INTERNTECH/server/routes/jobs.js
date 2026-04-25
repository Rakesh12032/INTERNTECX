import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { stateModels } from "../models/stateModels.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { location, experience, type, search } = req.query;
    let query = {};

    if (location) query.location = new RegExp(location, "i");
    if (experience) query.experience = new RegExp(experience, "i");
    if (type) query.type = new RegExp(`^${type}$`, "i");
    if (search) {
      query.$or = [
        { company: new RegExp(search, "i") },
        { role: new RegExp(search, "i") }
      ];
    }

    const jobs = await stateModels.jobs.find(query).lean();
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
});

router.get("/my/applications", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const applicationsDocs = await stateModels.jobApplications.find({ studentId: req.user.id }).lean();
    const applications = await Promise.all(
      applicationsDocs.map(async (application) => {
        const job = await stateModels.jobs.findOne({ id: application.jobId }).lean();
        return {
          ...application,
          location: job?.location || "",
          salary: job?.salary || "",
          experience: job?.experience || ""
        };
      })
    );

    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch job applications", error: error.message });
  }
});

router.get("/saved", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const savedJobsDocs = await stateModels.savedJobs.find({ studentId: req.user.id }).lean();
    const savedJobs = await Promise.all(
      savedJobsDocs.map(async (savedJob) => {
        const job = await stateModels.jobs.findOne({ id: savedJob.jobId }).lean();
        return job ? { ...savedJob, job } : null;
      })
    );

    return res.json(savedJobs.filter(Boolean));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch saved jobs", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const job = await stateModels.jobs.findOne({ id: req.params.id }).lean();

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.json({
      ...job,
      responsibilities: [
        "Collaborate with product and engineering teams",
        "Deliver clean, maintainable work",
        "Participate in code reviews and iteration"
      ],
      eligibility: [
        "Strong communication skills",
        "Basic technical fundamentals",
        "Willingness to learn quickly"
      ]
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch job detail", error: error.message });
  }
});

router.post("/:id/apply", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const job = await stateModels.jobs.findOne({ id: req.params.id }).lean();
    const student = await stateModels.users.findOne({ id: req.user.id }).lean();

    if (!job || !student) {
      return res.status(404).json({ message: "Job or student not found" });
    }

    const existing = await stateModels.jobApplications.findOne({
      jobId: job.id,
      studentId: student.id
    }).lean();

    if (existing) {
      return res.status(409).json({ message: "You have already applied for this job" });
    }

    const application = {
      id: uuidv4(),
      jobId: job.id,
      companyId: job.companyId || null,
      jobRole: job.role,
      company: job.company,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      college: student.college,
      branch: student.branch,
      status: "applied",
      createdAt: new Date().toISOString()
    };

    await stateModels.jobApplications.create(application);

    return res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to apply for job", error: error.message });
  }
});

router.post("/:id/save", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const job = await stateModels.jobs.findOne({ id: req.params.id }).lean();

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const existing = await stateModels.savedJobs.findOne({
      jobId: job.id,
      studentId: req.user.id
    }).lean();

    if (existing) {
      return res.status(409).json({ message: "Job already saved" });
    }

    const savedJob = {
      id: uuidv4(),
      studentId: req.user.id,
      jobId: job.id,
      savedAt: new Date().toISOString()
    };

    await stateModels.savedJobs.create(savedJob);

    return res.status(201).json({ message: "Job saved", savedJob });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save job", error: error.message });
  }
});

router.delete("/saved/:jobId", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const existing = await stateModels.savedJobs.findOne({
      jobId: req.params.jobId,
      studentId: req.user.id
    });

    if (!existing) {
      return res.status(404).json({ message: "Saved job not found" });
    }

    await stateModels.savedJobs.deleteOne({ _id: existing._id });

    return res.json({ message: "Saved job removed" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove saved job", error: error.message });
  }
});

export default router;
