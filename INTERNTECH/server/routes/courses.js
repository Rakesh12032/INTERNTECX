import { Router } from "express";
import db from "../db/database.js";
import { requireRole, verifyToken } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/", (req, res) => {
  try {
    db.read();
    const { category, level, duration, featured, limit, page = 1 } = req.query;
    let courses = [...db.data.courses];

    if (category) {
      courses = courses.filter((course) => course.category?.toLowerCase() === String(category).toLowerCase());
    }

    if (level) {
      courses = courses.filter((course) => course.level?.toLowerCase() === String(level).toLowerCase());
    }

    if (duration) {
      courses = courses.filter((course) => course.duration?.toLowerCase().includes(String(duration).toLowerCase()));
    }

    if (featured === "true") {
      courses = courses.filter((course) => course.featured);
    }

    const currentPage = Number(page) || 1;
    const pageSize = Number(limit) || 6;
    const total = courses.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCourses = courses.slice(startIndex, startIndex + pageSize);

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

router.get("/my", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();

    const enrollments = db.data.enrollments
      .filter((item) => item.studentId === req.user.id)
      .map((enrollment) => {
        const course = db.data.courses.find((item) => item.id === enrollment.courseId);

        return course
          ? {
              ...course,
              enrollment
            }
          : null;
      })
      .filter(Boolean);

    return res.json({ courses: enrollments });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch enrolled courses", error: error.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    db.read();
    const course = db.data.courses.find((item) => item.id === req.params.id || item.slug === req.params.id);

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

router.post("/enroll", verifyToken, requireRole("student"), (req, res) => {
  try {
    const { courseId } = req.body;
    db.read();

    const course = db.data.courses.find((item) => item.id === courseId || item.slug === courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existingEnrollment = db.data.enrollments.find(
      (item) => item.courseId === course.id && item.studentId === req.user.id
    );

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

    db.data.enrollments.push(enrollment);
    course.enrolledCount = (course.enrolledCount || 0) + 1;
    db.write();

    return res.status(201).json({ message: "Enrollment successful", enrollmentId: enrollment.id });
  } catch (error) {
    return res.status(500).json({ message: "Failed to enroll", error: error.message });
  }
});

router.get("/:id/progress", verifyToken, (req, res) => {
  try {
    db.read();
    const course = db.data.courses.find((item) => item.id === req.params.id || item.slug === req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = db.data.enrollments.find(
      (item) => item.courseId === course.id && item.studentId === req.user.id
    );

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

router.post("/lesson/complete", verifyToken, requireRole("student"), (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    db.read();

    const course = db.data.courses.find((item) => item.id === courseId || item.slug === courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = db.data.enrollments.find(
      (item) => item.courseId === course.id && item.studentId === req.user.id
    );

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
    db.write();

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
