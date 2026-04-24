import bcrypt from "bcryptjs";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { requireRole, verifyToken } from "../middleware/auth.js";
import { sendWithdrawalEmail } from "../utils/emailService.js";

const router = Router();

router.use(verifyToken, requireRole("admin"));

router.get("/stats", (req, res) => {
  try {
    db.read();
    const totalStudents = db.data.users.filter((item) => item.role === "student").length;
    const totalEnrollments = db.data.enrollments.length;
    const totalCertificates = db.data.certificates.length;
    const totalRevenue =
      db.data.internships.length * 999 +
      db.data.courses.filter((item) => item.price > 0).reduce((sum, item) => sum + item.price, 0);
    const pendingApplications = db.data.internshipApplications.filter((item) => item.status === "pending").length;
    const activeAmbassadors = db.data.ambassadors.filter((item) => item.status === "approved").length;

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

router.get("/internship-applications", (req, res) => {
  try {
    db.read();
    const status = req.query.status;
    let applications = [...db.data.internshipApplications];

    if (status) {
      applications = applications.filter((item) => item.status === status);
    }

    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch internship applications", error: error.message });
  }
});

router.put("/internship-applications/:id", (req, res) => {
  try {
    db.read();
    const application = db.data.internshipApplications.find((item) => item.id === req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Internship application not found" });
    }

    application.status = req.body.status || application.status;
    application.updatedAt = new Date().toISOString();
    db.write();

    return res.json({ message: "Internship application updated", application });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update internship application", error: error.message });
  }
});

router.get("/students", (req, res) => {
  try {
    db.read();
    const search = String(req.query.search || "").toLowerCase();
    let students = db.data.users.filter((item) => item.role === "student");

    if (search) {
      students = students.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.email.toLowerCase().includes(search) ||
          item.college?.toLowerCase().includes(search)
      );
    }

    return res.json(students);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
});

router.put("/students/:id/ban", (req, res) => {
  try {
    db.read();
    const student = db.data.users.find((item) => item.id === req.params.id && item.role === "student");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    student.status = "banned";
    db.write();
    return res.json({ message: "Student banned" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to ban student", error: error.message });
  }
});

router.put("/students/:id/unban", (req, res) => {
  try {
    db.read();
    const student = db.data.users.find((item) => item.id === req.params.id && item.role === "student");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    student.status = "active";
    db.write();
    return res.json({ message: "Student unbanned" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to unban student", error: error.message });
  }
});

router.get("/certificates", (req, res) => {
  try {
    db.read();
    return res.json(db.data.certificates);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch certificates", error: error.message });
  }
});

router.put("/certificates/:certId/revoke", (req, res) => {
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

router.post("/certificates/:certId/reissue", (req, res) => {
  try {
    db.read();
    const certificate = db.data.certificates.find((item) => item.certId === req.params.certId);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    certificate.status = "revoked";
    certificate.revokeReason = "Reissued by admin";

    const nextCertificate = {
      ...certificate,
      id: uuidv4(),
      certId: `INT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "active",
      revokeReason: null,
      completionDate: new Date().toISOString()
    };

    db.data.certificates.push(nextCertificate);
    db.write();
    return res.json({ message: "Certificate reissued", certificate: nextCertificate });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reissue certificate", error: error.message });
  }
});

router.get("/verification-logs", (req, res) => {
  try {
    db.read();
    return res.json(db.data.verificationLogs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch verification logs", error: error.message });
  }
});

router.get("/withdrawals", (req, res) => {
  try {
    db.read();
    const status = req.query.status;
    let requests = [...db.data.withdrawalRequests];
    if (status) {
      requests = requests.filter((item) => item.status === status);
    }
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch withdrawals", error: error.message });
  }
});

router.put("/withdrawals/:id", async (req, res) => {
  try {
    db.read();
    const request = db.data.withdrawalRequests.find((item) => item.id === req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    const previousStatus = request.status;
    request.status = req.body.status || request.status;
    request.reason = req.body.reason || request.reason || null;

    const student = db.data.users.find((item) => item.id === request.studentId);

    if (
      request.status === "rejected" &&
      previousStatus !== "rejected" &&
      student &&
      !request.balanceRestored
    ) {
      student.walletBalance = (student.walletBalance || 0) + Number(request.amount || 0);
      request.balanceRestored = true;
      db.data.walletHistory.push({
        id: uuidv4(),
        userId: student.id,
        type: "credit",
        amount: Number(request.amount || 0),
        description: "Withdrawal rejected - amount restored",
        timestamp: new Date().toISOString()
      });
    }

    if (request.status === "approved") {
      request.balanceRestored = false;
    }

    db.write();

    if (student) {
      await sendWithdrawalEmail(student.email, student.name, request.amount, request.status);
    }

    return res.json({ message: "Withdrawal updated", request });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update withdrawal", error: error.message });
  }
});

router.get("/ambassadors", (req, res) => {
  try {
    db.read();
    const status = req.query.status;
    let ambassadors = [...db.data.ambassadors];
    if (status) {
      ambassadors = ambassadors.filter((item) => item.status === status);
    }
    return res.json(ambassadors);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch ambassadors", error: error.message });
  }
});

router.put("/ambassadors/:id", (req, res) => {
  try {
    db.read();
    const ambassador = db.data.ambassadors.find((item) => item.id === req.params.id);
    if (!ambassador) {
      return res.status(404).json({ message: "Ambassador application not found" });
    }
    ambassador.status = req.body.status || ambassador.status;
    db.write();
    return res.json({ message: "Ambassador status updated", ambassador });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update ambassador", error: error.message });
  }
});

router.get("/colleges", (req, res) => {
  try {
    db.read();
    return res.json(db.data.colleges);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch colleges", error: error.message });
  }
});

router.post("/colleges", async (req, res) => {
  try {
    const { name, email, password, city, state } = req.body;
    db.read();
    const existing = db.data.colleges.find((item) => item.email === email);
    if (existing) {
      return res.status(409).json({ message: "College email already exists" });
    }

    db.data.colleges.push({
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
    db.write();
    return res.status(201).json({ message: "College created" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create college", error: error.message });
  }
});

router.get("/companies", (req, res) => {
  try {
    db.read();
    return res.json(db.data.companies);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch companies", error: error.message });
  }
});

router.get("/courses", (req, res) => {
  try {
    db.read();
    return res.json(db.data.courses);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch courses", error: error.message });
  }
});

router.post("/courses", (req, res) => {
  try {
    db.read();
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
        name: req.body.mentorName || "InternTech Mentor",
        designation: req.body.mentorDesignation || "Mentor",
        linkedin: req.body.mentorLinkedIn || ""
      },
      modules: req.body.modules || [],
      featured: Boolean(req.body.featured),
      enrolledCount: 0,
      rating: 4.5,
      createdAt: new Date().toISOString()
    };
    db.data.courses.push(course);
    db.write();
    return res.status(201).json({ message: "Course created", course });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create course", error: error.message });
  }
});

router.put("/courses/:id", (req, res) => {
  try {
    db.read();
    const course = db.data.courses.find((item) => item.id === req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    Object.assign(course, req.body);
    db.write();
    return res.json({ message: "Course updated", course });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update course", error: error.message });
  }
});

router.delete("/courses/:id", (req, res) => {
  try {
    db.read();
    const existing = db.data.courses.find((item) => item.id === req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Course not found" });
    }
    db.data.courses = db.data.courses.filter((item) => item.id !== req.params.id);
    db.write();
    return res.json({ message: "Course deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
});

router.put("/companies/:id/approve", (req, res) => {
  try {
    db.read();
    const company = db.data.companies.find((item) => item.id === req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    company.status = "approved";
    db.write();
    return res.json({ message: "Company approved" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve company", error: error.message });
  }
});

router.put("/companies/:id/reject", (req, res) => {
  try {
    db.read();
    const company = db.data.companies.find((item) => item.id === req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    company.status = "rejected";
    db.write();
    return res.json({ message: "Company rejected" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject company", error: error.message });
  }
});

export default router;
