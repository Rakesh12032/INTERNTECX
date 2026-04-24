import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();

function buildLast90DaysHeatmap(events, userId) {
  const dateMap = new Map();

  (events || [])
    .filter((event) => event.userId === userId)
    .forEach((event) => {
      const dateKey = new Date(event.createdAt).toISOString().slice(0, 10);
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    });

  return Array.from({ length: 90 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (89 - index));
    const dateKey = date.toISOString().slice(0, 10);

    return {
      date: dateKey,
      count: dateMap.get(dateKey) || 0
    };
  });
}

router.get("/student", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const enrollments = db.data.enrollments.filter((item) => item.studentId === req.user.id);
    const attempts = db.data.quizAttempts.filter((item) => item.studentId === req.user.id);
    const certificates = db.data.certificates.filter((item) => item.studentId === req.user.id);
    const analyticsEvents = db.data.analyticsEvents || [];

    const totalLessonsCompleted = enrollments.reduce(
      (sum, item) => sum + (item.completedLessons?.length || 0),
      0
    );
    const avgQuizScore = attempts.length
      ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length)
      : 0;

    return res.json({
      totalLessonsCompleted,
      totalHoursLearned: Math.max(1, Math.round(totalLessonsCompleted * 0.4)),
      avgQuizScore,
      currentStreak: Math.min(7, totalLessonsCompleted),
      longestStreak: Math.max(3, Math.min(14, totalLessonsCompleted + 2)),
      activityHeatmap: buildLast90DaysHeatmap(analyticsEvents, req.user.id),
      courseProgress: enrollments.map((item) => {
        const course = db.data.courses.find((courseEntry) => courseEntry.id === item.courseId);
        return {
          courseName: course?.title || "Course",
          progress: item.progress || 0
        };
      }),
      quizScores: attempts.map((item) => ({
        date: item.timestamp,
        score: item.score
      })),
      skillScores: [
        { skill: "Web Dev", score: 72 },
        { skill: "Python", score: 65 },
        { skill: "DSA", score: 48 },
        { skill: "AI/ML", score: 52 },
        { skill: "Database", score: 60 },
        { skill: "Cloud", score: 40 }
      ],
      timeDistribution: enrollments.map((item) => {
        const course = db.data.courses.find((courseEntry) => courseEntry.id === item.courseId);
        return {
          name: course?.title || "Course",
          hours: Math.max(1, Math.round((item.completedLessons?.length || 0) * 0.4))
        };
      }),
      badges: certificates.map((item) => ({
        id: item.certId,
        name: `${item.courseName} Finisher`
      })),
      weeklyGoalHours: 8
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
});

router.post("/log-activity", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    db.data.analyticsEvents ||= [];
    db.data.analyticsEvents.push({
      id: uuidv4(),
      userId: req.user.id,
      type: req.body.type,
      createdAt: new Date().toISOString()
    });
    db.write();
    return res.json({ message: "Activity logged" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to log activity", error: error.message });
  }
});

export default router;
