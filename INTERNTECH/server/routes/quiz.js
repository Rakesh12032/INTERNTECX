import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/course/:courseId", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const course = db.data.courses.find((item) => item.id === req.params.courseId || item.slug === req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const attempts = db.data.quizAttempts.filter(
      (item) => item.studentId === req.user.id && item.courseId === course.id
    );
    const enrollment = db.data.enrollments.find(
      (item) => item.studentId === req.user.id && item.courseId === course.id
    );

    if (!enrollment) {
      return res.status(403).json({ message: "Enroll in the course before taking the quiz" });
    }

    if (!enrollment.quizUnlocked && enrollment.progress !== 100) {
      return res
        .status(403)
        .json({ message: "Complete all lessons before starting the final assessment" });
    }

    if (attempts.length >= 3) {
      const lastAttempt = attempts[attempts.length - 1];
      if (Date.now() - new Date(lastAttempt.timestamp).getTime() < 24 * 60 * 60 * 1000) {
        return res.status(429).json({ message: "Attempt limit reached. Please try again after 24 hours." });
      }
    }

    const questions = db.data.quizzes
      .filter((item) => item.courseId === course.id)
      .map(({ correctAnswer, explanation, ...safeQuestion }) => safeQuestion);

    return res.json({
      course: {
        id: course.id,
        title: course.title
      },
      attemptsUsed: attempts.length,
      attemptsLeft: Math.max(0, 3 - attempts.length),
      questions
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch quiz", error: error.message });
  }
});

router.post("/submit", verifyToken, requireRole("student"), (req, res) => {
  try {
    const { courseId, answers, tabSwitchCount = 0, autoSubmitted = false } = req.body;
    db.read();

    const course = db.data.courses.find((item) => item.id === courseId || item.slug === courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = db.data.enrollments.find(
      (item) => item.studentId === req.user.id && item.courseId === course.id
    );

    if (!enrollment) {
      return res.status(403).json({ message: "Enroll in the course before attempting the quiz" });
    }

    if (!enrollment.quizUnlocked && enrollment.progress !== 100) {
      return res.status(403).json({ message: "Course completion required before quiz submission" });
    }

    const attempts = db.data.quizAttempts.filter(
      (item) => item.studentId === req.user.id && item.courseId === course.id
    );

    if (attempts.length >= 3) {
      const lastAttempt = attempts[attempts.length - 1];
      if (Date.now() - new Date(lastAttempt.timestamp).getTime() < 24 * 60 * 60 * 1000) {
        return res.status(429).json({ message: "Attempt limit reached. Please try again after 24 hours." });
      }
    }

    const questions = db.data.quizzes.filter((item) => item.courseId === course.id);
    if (!questions.length) {
      return res.status(404).json({ message: "Quiz questions not found" });
    }

    const answerMap = new Map((answers || []).map((item) => [item.questionId, Number(item.selectedOption)]));
    let correct = 0;

    const review = questions.map((question) => {
      const selectedOption = answerMap.get(question.id);
      const isCorrect = selectedOption === question.correctAnswer;
      if (isCorrect) correct += 1;
      return {
        questionId: question.id,
        selectedOption,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        topic: question.topic
      };
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70;

    const attempt = {
      id: uuidv4(),
      studentId: req.user.id,
      courseId: course.id,
      score,
      passed,
      tabSwitchCount: Number(tabSwitchCount) || 0,
      autoSubmitted: Boolean(autoSubmitted),
      answers: review,
      timestamp: new Date().toISOString()
    };

    db.data.quizAttempts.push(attempt);
    db.write();

    return res.json({
      score,
      passed,
      correctAnswers: correct,
      totalQuestions: questions.length,
      explanations: review,
      weakTopics: [...new Set(review.filter((item) => item.selectedOption !== item.correctAnswer).map((item) => item.topic))]
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit quiz", error: error.message });
  }
});

router.get("/attempts/:courseId", verifyToken, requireRole("student"), (req, res) => {
  try {
    db.read();
    const course = db.data.courses.find((item) => item.id === req.params.courseId || item.slug === req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const attempts = db.data.quizAttempts.filter(
      (item) => item.studentId === req.user.id && item.courseId === course.id
    );

    return res.json(attempts);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch quiz attempts", error: error.message });
  }
});

export default router;
