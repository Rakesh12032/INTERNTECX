import { Router } from "express";
import { stateModels } from "../models/stateModels.js";
import { requireRole, verifyToken } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, level, duration, featured, limit, page = 1 } = req.query;
    
    let query = {};
    if (category) query.category = new RegExp(`^${category}$`, "i");
    if (level) query.level = new RegExp(`^${level}$`, "i");
    if (duration) query.duration = new RegExp(duration, "i");
    if (featured === "true") query.featured = true;

    const currentPage = Number(page) || 1;
    const pageSize = Number(limit) || 6;
    const total = await stateModels.courses.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const skip = (currentPage - 1) * pageSize;
    const paginatedCourses = await stateModels.courses.find(query).skip(skip).limit(pageSize).lean();

    return res.json({
      courses: paginatedCourses,
      pagination: {
        page: currentPage,
        total,
        totalPages,
        limit: pageSize
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch courses", error: error.message });
  }
});

router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const enrollmentsDocs = await stateModels.enrollments.find({ studentId: req.user.id }).lean();
    const enrollments = await Promise.all(
      enrollmentsDocs.map(async (enrollment) => {
        const course = await stateModels.courses.findOne({ id: enrollment.courseId }).lean();
        return course ? { ...course, enrollment } : null;
      })
    );
    const filteredEnrollments = enrollments.filter(Boolean);

    return res.json({ courses: filteredEnrollments });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch enrolled courses", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await stateModels.courses.findOne({
      $or: [{ id: req.params.id }, { slug: req.params.id }]
    }).lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.json({
      ...course,
      prerequisites: ["Basic computer literacy", "Internet access", "Commitment to weekly practice"],
      mentorInfo: course.mentor
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch course", error: error.message });
  }
});

router.post("/enroll", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await stateModels.courses.findOne({
      $or: [{ id: courseId }, { slug: courseId }]
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existingEnrollment = await stateModels.enrollments.findOne({
      courseId: course.id,
      studentId: req.user.id
    }).lean();

    if (existingEnrollment) {
      return res.status(409).json({ message: "You are already enrolled in this course" });
    }

    const enrollment = {
      id: uuidv4(),
      courseId: course.id,
      studentId: req.user.id,
      completedLessons: [],
      progress: 0,
      quizUnlocked: false,
      createdAt: new Date().toISOString()
    };

    await stateModels.enrollments.create(enrollment);
    course.enrolledCount = (course.enrolledCount || 0) + 1;
    await course.save();

    return res.status(201).json({ message: "Enrollment successful", enrollmentId: enrollment.id });
  } catch (error) {
    return res.status(500).json({ message: "Failed to enroll", error: error.message });
  }
});

router.get("/:id/progress", verifyToken, async (req, res) => {
  try {
    const course = await stateModels.courses.findOne({
      $or: [{ id: req.params.id }, { slug: req.params.id }]
    }).lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await stateModels.enrollments.findOne({
      courseId: course.id,
      studentId: req.user.id
    }).lean();

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    return res.json({
      enrollment,
      completedLessons: enrollment.completedLessons || []
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch progress", error: error.message });
  }
});

router.post("/lesson/complete", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const course = await stateModels.courses.findOne({
      $or: [{ id: courseId }, { slug: courseId }]
    }).lean();
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await stateModels.enrollments.findOne({
      courseId: course.id,
      studentId: req.user.id
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const completedLessons = new Set(enrollment.completedLessons || []);
    completedLessons.add(lessonId);
    enrollment.completedLessons = Array.from(completedLessons);
    enrollment.progress = Math.min(100, Math.round((enrollment.completedLessons.length / totalLessons) * 100));
    enrollment.quizUnlocked = enrollment.progress === 100;
    enrollment.updatedAt = new Date().toISOString();
    await enrollment.save();

    return res.json({
      message: "Lesson marked complete",
      progress: enrollment.progress,
      quizUnlocked: enrollment.quizUnlocked
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to complete lesson", error: error.message });
  }
});

export default router;
