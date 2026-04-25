import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { stateModels } from "../models/stateModels.js";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/course/:courseId", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const course = await stateModels.courses.findOne({
      $or: [{ id: req.params.courseId }, { slug: req.params.courseId }]
    }).lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const attempts = await stateModels.quizAttempts.find({
      studentId: req.user.id,
      courseId: course.id
    }).lean();
    const enrollment = await stateModels.enrollments.findOne({
      studentId: req.user.id,
      courseId: course.id
    }).lean();

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

    const questionsDocs = await stateModels.quizzes.find({ courseId: course.id }).lean();
    const questions = questionsDocs.map(({ correctAnswer, explanation, ...safeQuestion }) => safeQuestion);

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

router.post("/submit", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { courseId, answers, tabSwitchCount = 0, autoSubmitted = false } = req.body;
    const course = await stateModels.courses.findOne({
      $or: [{ id: courseId }, { slug: courseId }]
    }).lean();
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await stateModels.enrollments.findOne({
      studentId: req.user.id,
      courseId: course.id
    }).lean();

    if (!enrollment) {
      return res.status(403).json({ message: "Enroll in the course before attempting the quiz" });
    }

    if (!enrollment.quizUnlocked && enrollment.progress !== 100) {
      return res.status(403).json({ message: "Course completion required before quiz submission" });
    }

    const attempts = await stateModels.quizAttempts.find({
      studentId: req.user.id,
      courseId: course.id
    }).lean();

    if (attempts.length >= 3) {
      const lastAttempt = attempts[attempts.length - 1];
      if (Date.now() - new Date(lastAttempt.timestamp).getTime() < 24 * 60 * 60 * 1000) {
        return res.status(429).json({ message: "Attempt limit reached. Please try again after 24 hours." });
      }
    }

    const questions = await stateModels.quizzes.find({ courseId: course.id }).lean();
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

    await stateModels.quizAttempts.create(attempt);

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

router.get("/attempts/:courseId", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const course = await stateModels.courses.findOne({
      $or: [{ id: req.params.courseId }, { slug: req.params.courseId }]
    }).lean();
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const attempts = await stateModels.quizAttempts.find({
      studentId: req.user.id,
      courseId: course.id
    }).lean();

    return res.json(attempts);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch quiz attempts", error: error.message });
  }
});

export default router;
