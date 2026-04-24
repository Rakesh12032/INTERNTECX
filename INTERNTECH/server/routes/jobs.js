import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    db.read();
    const { location, experience, type, search } = req.query;
    let jobs = [...db.data.jobs];

    if (location) {
      jobs = jobs.filter((job) => job.location.toLowerCase().includes(String(location).toLowerCase()));
    }

    if (experience) {
      jobs = jobs.filter((job) => job.experience.toLowerCase().includes(String(experience).toLowerCase()));
    }

    if (type) {
      jobs = jobs.filter((job) => job.type.toLowerCase() === String(type).toLowerCase());
    }

    if (search) {
      const query = String(search).toLowerCase();
      jobs = jobs.filter(
        (job) => job.company.toLowerCase().includes(query) || job.role.toLowerCase().includes(query)
      );
    }

    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
});

router.get("/my/applications", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const applications = db.data.jobApplications
      .filter((item) => item.studentId === req.user.id)
      .map((application) => {
        const job = db.data.jobs.find((item) => item.id === application.jobId);

        return {
          ...application,
          location: job?.location || "",
          salary: job?.salary || "",
          experience: job?.experience || ""
        };
      });

    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch job applications", error: error.message });
  }
});

router.get("/saved", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const savedJobs = db.data.savedJobs
      .filter((item) => item.studentId === req.user.id)
      .map((savedJob) => {
        const job = db.data.jobs.find((item) => item.id === savedJob.jobId);

        return job
          ? {
              ...savedJob,
              job
            }
          : null;
      })
      .filter(Boolean);

    return res.json(savedJobs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch saved jobs", error: error.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    db.read();
    const job = db.data.jobs.find((item) => item.id === req.params.id);

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

router.post("/:id/apply", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const job = db.data.jobs.find((item) => item.id === req.params.id);
    const student = db.data.users.find((item) => item.id === req.user.id);

    if (!job || !student) {
      return res.status(404).json({ message: "Job or student not found" });
    }

    const existing = db.data.jobApplications.find(
      (item) => item.jobId === job.id && item.studentId === student.id
    );

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

    db.data.jobApplications.push(application);
    db.write();

    return res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to apply for job", error: error.message });
  }
});

router.post("/:id/save", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const job = db.data.jobs.find((item) => item.id === req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const existing = db.data.savedJobs.find(
      (item) => item.jobId === job.id && item.studentId === req.user.id
    );

    if (existing) {
      return res.status(409).json({ message: "Job already saved" });
    }

    const savedJob = {
      id: uuidv4(),
      studentId: req.user.id,
      jobId: job.id,
      savedAt: new Date().toISOString()
    };

    db.data.savedJobs.push(savedJob);
    db.write();

    return res.status(201).json({ message: "Job saved", savedJob });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save job", error: error.message });
  }
});

router.delete("/saved/:jobId", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const existing = db.data.savedJobs.find(
      (item) => item.jobId === req.params.jobId && item.studentId === req.user.id
    );

    if (!existing) {
      return res.status(404).json({ message: "Saved job not found" });
    }

    db.data.savedJobs = db.data.savedJobs.filter((item) => item.id !== existing.id);
    db.write();

    return res.json({ message: "Saved job removed" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove saved job", error: error.message });
  }
});

export default router;
