import bcrypt from "bcryptjs";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { stateModels } from "../models/stateModels.js";
import { requireRole, verifyToken } from "../middleware/auth.js";
import { sendWithdrawalEmail } from "../utils/emailService.js";

const router = Router();

router.use(verifyToken, requireRole("admin"));

router.get("/stats", async (req, res) => {
  try {
    const totalStudents = await stateModels.users.countDocuments({ role: "student" });
    const totalEnrollments = await stateModels.enrollments.countDocuments();
    const totalCertificates = await stateModels.certificates.countDocuments();
    
    const internshipsCount = await stateModels.internships.countDocuments();
    const coursesDocs = await stateModels.courses.find({ price: { $gt: 0 } }).lean();
    const totalRevenue = internshipsCount * 999 + coursesDocs.reduce((sum, item) => sum + item.price, 0);
    
    const pendingApplications = await stateModels.internshipApplications.countDocuments({ status: "pending" });
    const activeAmbassadors = await stateModels.ambassadors.countDocuments({ status: "approved" });

    return res.json({
      totalStudents,
      totalEnrollments,
      totalCertificates,
      totalRevenue,
      pendingApplications,
      activeAmbassadors,
      monthlyRegistrations: []
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin stats", error: error.message });
  }
});

router.get("/internship-applications", async (req, res) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const applications = await stateModels.internshipApplications.find(query).lean();

    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch internship applications", error: error.message });
  }
});

router.put("/internship-applications/:id", async (req, res) => {
  try {
    const application = await stateModels.internshipApplications.findOne({ id: req.params.id });

    if (!application) {
      return res.status(404).json({ message: "Internship application not found" });
    }

    application.status = req.body.status || application.status;
    application.updatedAt = new Date().toISOString();
    await application.save();

    return res.json({ message: "Internship application updated", application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update internship application", error: error.message });
  }
});

router.get("/students", async (req, res) => {
  try {
    const search = String(req.query.search || "");
    const query = { role: "student" };

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { name: regex },
        { email: regex },
        { college: regex }
      ];
    }

    const students = await stateModels.users.find(query).lean();

    return res.json(students);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
});

router.put("/students/:id/ban", async (req, res) => {
  try {
    const student = await stateModels.users.findOne({ id: req.params.id, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    student.status = "banned";
    await student.save();
    return res.json({ message: "Student banned" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to ban student", error: error.message });
  }
});

router.put("/students/:id/unban", async (req, res) => {
  try {
    const student = await stateModels.users.findOne({ id: req.params.id, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    student.status = "active";
    await student.save();
    return res.json({ message: "Student unbanned" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to unban student", error: error.message });
  }
});

router.get("/certificates", async (req, res) => {
  try {
    const certificates = await stateModels.certificates.find({}).lean();
    return res.json(certificates);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch certificates", error: error.message });
  }
});

router.post("/certificates/manual", async (req, res) => {
  try {
    const { studentName, courseName, duration, college } = req.body;
    
    if (!studentName || !courseName) {
      return res.status(400).json({ message: "Student Name and Course Name are required" });
    }

    const certificate = {
      id: uuidv4(),
      certId: `INT-MAN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: "manual",
      studentName,
      college: college || "N/A",
      courseId: "manual",
      courseName,
      completionDate: new Date().toISOString(),
      duration: duration || "4 Weeks",
      type: "manual",
      status: "active"
    };

    await stateModels.certificates.create(certificate);
    return res.status(201).json({ message: "Manual certificate generated", certificate });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate manual certificate", error: error.message });
  }
});

router.put("/certificates/:certId/revoke", async (req, res) => {
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

router.post("/certificates/:certId/reissue", async (req, res) => {
  try {
    const certificate = await stateModels.certificates.findOne({ certId: req.params.certId });
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    certificate.status = "revoked";
    certificate.revokeReason = "Reissued by admin";
    await certificate.save();

    const certObj = certificate.toObject ? certificate.toObject() : certificate;
    delete certObj._id;
    delete certObj.__v;

    const nextCertificate = {
      ...certObj,
      id: uuidv4(),
      certId: `INT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "active",
      revokeReason: null,
      completionDate: new Date().toISOString()
    };

    await stateModels.certificates.create(nextCertificate);
    return res.json({ message: "Certificate reissued", certificate: nextCertificate });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reissue certificate", error: error.message });
  }
});

router.get("/verification-logs", async (req, res) => {
  try {
    const logs = await stateModels.verificationLogs.find({}).lean();
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch verification logs", error: error.message });
  }
});

router.get("/withdrawals", async (req, res) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const requests = await stateModels.withdrawalRequests.find(query).lean();
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch withdrawals", error: error.message });
  }
});

router.put("/withdrawals/:id", async (req, res) => {
  try {
    const request = await stateModels.withdrawalRequests.findOne({ id: req.params.id });
    if (!request) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    request.status = req.body.status || request.status;
    request.reason = req.body.reason || request.reason || null;
    await request.save();

    const student = await stateModels.users.findOne({ id: request.studentId }).lean();

    if (student) {
      await sendWithdrawalEmail(student.email, student.name, request.amount, request.status);
    }

    return res.json({ message: "Withdrawal updated", request });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update withdrawal", error: error.message });
  }
});

router.get("/ambassadors", async (req, res) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const ambassadors = await stateModels.ambassadors.find(query).lean();
    return res.json(ambassadors);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch ambassadors", error: error.message });
  }
});

router.put("/ambassadors/:id", async (req, res) => {
  try {
    const ambassador = await stateModels.ambassadors.findOne({ id: req.params.id });
    if (!ambassador) {
      return res.status(404).json({ message: "Ambassador application not found" });
    }
    ambassador.status = req.body.status || ambassador.status;
    await ambassador.save();
    return res.json({ message: "Ambassador status updated", ambassador });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update ambassador", error: error.message });
  }
});

router.get("/colleges", async (req, res) => {
  try {
    const colleges = await stateModels.colleges.find({}).lean();
    return res.json(colleges);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch colleges", error: error.message });
  }
});

router.post("/colleges", async (req, res) => {
  try {
    const { name, email, password, city, state } = req.body;
    const existing = await stateModels.colleges.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ message: "College email already exists" });
    }

    await stateModels.colleges.create({
      id: uuidv4(),
      name,
      email,
      password: await bcrypt.hash(password || "College@123", 12),
      role: "college",
      city,
      state,
      status: "active",
      createdAt: new Date().toISOString()
    });
    return res.status(201).json({ message: "College created" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create college", error: error.message });
  }
});

router.get("/companies", async (req, res) => {
  try {
    const companies = await stateModels.companies.find({}).lean();
    return res.json(companies);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch companies", error: error.message });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const courses = await stateModels.courses.find({}).lean();
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch courses", error: error.message });
  }
});

router.post("/courses", async (req, res) => {
  try {
    const course = {
      id: uuidv4(),
      title: req.body.title,
      slug: String(req.body.title || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
      description: req.body.description || "",
      overview: req.body.description || "",
      category: req.body.category || "General",
      level: req.body.level || "Beginner",
      duration: req.body.duration || "4 weeks",
      price: Number(req.body.price || 0),
      mentor: {
        name: req.body.mentorName || "Interntex Mentor",
        designation: req.body.mentorDesignation || "Mentor",
        linkedin: req.body.mentorLinkedIn || ""
      },
      modules: req.body.modules || [],
      featured: Boolean(req.body.featured),
      enrolledCount: 0,
      rating: 4.5,
      createdAt: new Date().toISOString()
    };
    await stateModels.courses.create(course);
    return res.status(201).json({ message: "Course created", course });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create course", error: error.message });
  }
});

router.put("/courses/:id", async (req, res) => {
  try {
    const course = await stateModels.courses.findOne({ id: req.params.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    Object.assign(course, req.body);
    await course.save();
    return res.json({ message: "Course updated", course });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update course", error: error.message });
  }
});

router.delete("/courses/:id", async (req, res) => {
  try {
    const existing = await stateModels.courses.findOne({ id: req.params.id });
    if (!existing) {
      return res.status(404).json({ message: "Course not found" });
    }
    await stateModels.courses.deleteOne({ _id: existing._id });
    return res.json({ message: "Course deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
});

router.put("/companies/:id/approve", async (req, res) => {
  try {
    const company = await stateModels.companies.findOne({ id: req.params.id });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    company.status = "approved";
    await company.save();
    return res.json({ message: "Company approved" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve company", error: error.message });
  }
});

router.put("/companies/:id/reject", async (req, res) => {
  try {
    const company = await stateModels.companies.findOne({ id: req.params.id });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    company.status = "rejected";
    await company.save();
    return res.json({ message: "Company rejected" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject company", error: error.message });
  }
});

export default router;
