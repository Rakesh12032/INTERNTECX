import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function QuizAssessment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const [quiz, setQuiz] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await api.get(`/quiz/course/${courseId}`);
        setQuiz(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load quiz");
      }
    };

    loadQuiz();
  }, [courseId]);

  useEffect(() => {
    if (!started || result) {
      return undefined;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(intervalRef.current);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalRef.current);
    };
  }, [started, result]);

  useEffect(() => {
    if (!started || result || timeLeft !== 0) {
      return;
    }

    toast("Time is over. Submitting your quiz.");
    submitQuiz(true);
  }, [timeLeft, started, result]);

  useEffect(() => {
    if (!started || result) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") {
        return;
      }

      setTabWarnings((previous) => {
        const nextCount = previous + 1;
        if (nextCount >= 3) {
          toast.error("Final warning reached. Quiz is being auto-submitted.");
          submitQuiz(true, nextCount);
          return nextCount;
        }

        toast.error(`Warning ${nextCount}/3: tab switching detected.`);
        return nextCount;
      });
    };

    const preventContextMenu = (event) => {
      event.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [started, result]);

  useEffect(() => {
    if (!quiz?.questions?.length) {
      return;
    }

    setVisited((previous) => ({
      ...previous,
      [quiz.questions[currentIndex].id]: true
    }));
  }, [currentIndex, quiz]);

  const question = quiz?.questions?.[currentIndex];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const unansweredCount = useMemo(
    () => Math.max(0, (quiz?.questions?.length || 0) - answeredCount),
    [answeredCount, quiz]
  );

  const submitQuiz = async (autoSubmitted = false, warningCount = tabWarnings) => {
    if (!quiz || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      window.clearInterval(intervalRef.current);

      const payload = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption
      }));

      const response = await api.post("/quiz/submit", {
        courseId: quiz.course.id,
        answers: payload,
        tabSwitchCount: warningCount,
        autoSubmitted
      });

      await api.post("/analytics/log-activity", {
        type: "quiz_attempt"
      });

      setResult(response.data);

      if (response.data.passed) {
        try {
          await api.post("/certificates/generate", { courseId: quiz.course.id, type: "course" });
          toast.success("Quiz passed. Certificate generated.");
        } catch (_error) {
          toast.success("Quiz passed.");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const optionStateClass = (questionId, index) =>
    answers[questionId] === index
      ? "border-blue bg-blue/10 text-blue"
      : "border-slate-200 hover:border-blue dark:border-slate-700";

  const paletteStateClass = (item, index) => {
    if (currentIndex === index) return "bg-navy text-white";
    if (answers[item.id] !== undefined) return "bg-blue text-white";
    if (visited[item.id]) return "bg-gold text-navy";
    return "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300";
  };

  if (!quiz) {
    return <div className="mx-auto max-w-5xl px-4 py-16">Loading quiz...</div>;
  }

  if (result) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div
          className={`rounded-[36px] border p-10 ${
            result.passed ? "border-success bg-success/10" : "border-danger bg-danger/10"
          }`}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className={`text-4xl font-bold ${result.passed ? "text-success" : "text-danger"}`}>
                {result.passed
                  ? `You Passed! Score: ${result.score}%`
                  : `Score: ${result.score}%. You need 70% to pass.`}
              </h1>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                Tab warnings: {tabWarnings} | Unanswered at submit: {unansweredCount}
              </p>
            </div>
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-[10px] border-white/70 bg-white/40 text-center dark:border-slate-900/40 dark:bg-slate-900/30">
              <div>
                <p className="text-4xl font-bold">{result.score}%</p>
                <p className="text-xs uppercase tracking-[0.18em]">Score</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/70 p-4 dark:bg-slate-900/40">
              <p className="text-sm text-slate-500 dark:text-slate-400">Correct</p>
              <p className="mt-2 text-2xl font-bold">{result.correctAnswers}</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 dark:bg-slate-900/40">
              <p className="text-sm text-slate-500 dark:text-slate-400">Wrong</p>
              <p className="mt-2 text-2xl font-bold">
                {result.totalQuestions - result.correctAnswers - unansweredCount}
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 dark:bg-slate-900/40">
              <p className="text-sm text-slate-500 dark:text-slate-400">Skipped</p>
              <p className="mt-2 text-2xl font-bold">{unansweredCount}</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 dark:bg-slate-900/40">
              <p className="text-sm text-slate-500 dark:text-slate-400">Weak Topics</p>
              <p className="mt-2 text-sm font-semibold">
                {result.weakTopics?.join(", ") || "None"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {result.passed ? (
              <Link
                to="/dashboard/certificates"
                className="rounded-2xl bg-blue px-5 py-3 text-sm font-semibold text-white"
              >
                View Certificate
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-2xl bg-blue px-5 py-3 text-sm font-semibold text-white"
              >
                Retake Quiz
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAnswers((previous) => !previous)}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold dark:border-slate-700"
            >
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/learn/${courseId}`)}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold dark:border-slate-700"
            >
              Back to Course
            </button>
          </div>

          {showAnswers ? (
            <div className="mt-8 space-y-4">
              {result.explanations.map((item, index) => (
                <div
                  key={item.questionId}
                  className="rounded-2xl border border-white/60 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/30"
                >
                  <p className="text-sm font-semibold">Question {index + 1}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Correct option: {String.fromCharCode(65 + item.correctAnswer)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Explanation: {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-[36px] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-4xl font-bold">{quiz.course.title} Assessment</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Questions</p>
              <p className="mt-2 text-2xl font-bold">{quiz.questions.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Pass Mark</p>
              <p className="mt-2 text-2xl font-bold">70%</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Attempts Left</p>
              <p className="mt-2 text-2xl font-bold">{quiz.attemptsLeft}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Time Limit</p>
              <p className="mt-2 text-2xl font-bold">20 min</p>
            </div>
          </div>
          <div className="mt-8 rounded-3xl border border-gold/40 bg-gold/10 p-5 text-sm text-slate-700 dark:text-slate-200">
            Do not switch tabs more than 2 times. On the 3rd switch, the quiz auto-submits.
          </div>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-8 rounded-2xl bg-blue px-6 py-4 text-sm font-semibold text-white transition hover:bg-navy"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <section className="rounded-[36px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span>{quiz.course.title}</span>
            <span>
              Question {currentIndex + 1} of {quiz.questions.length}
            </span>
            <span className={timeLeft < 300 ? "font-bold text-danger" : ""}>
              Time Left: {formatTime(timeLeft)}
            </span>
          </div>
          <h1 className="mt-6 text-3xl font-bold">{question.question}</h1>
          <div className="mt-8 space-y-4">
            {question.options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: index }))}
                className={`block w-full rounded-2xl border px-5 py-4 text-left text-sm font-medium transition ${optionStateClass(
                  question.id,
                  index
                )}`}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex((previous) => Math.max(0, previous - 1))}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold dark:border-slate-700"
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => submitQuiz(false)}
                disabled={submitting}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold dark:border-slate-700"
              >
                Submit Quiz
              </button>
              {currentIndex === quiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => submitQuiz(false)}
                  disabled={submitting}
                  className="rounded-2xl bg-blue px-5 py-3 text-sm font-semibold text-white"
                >
                  {submitting ? "Submitting..." : "Finish"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((previous) =>
                      Math.min(quiz.questions.length - 1, previous + 1)
                    )
                  }
                  className="rounded-2xl bg-blue px-5 py-3 text-sm font-semibold text-white"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="rounded-[36px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold">Question Palette</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {answeredCount} answered | {tabWarnings}/3 warnings
          </p>
          <div className="mt-6 grid grid-cols-4 gap-3">
            {quiz.questions.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-12 rounded-2xl text-sm font-semibold ${paletteStateClass(item, index)}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <p>Blue: answered</p>
            <p>Gold: visited</p>
            <p>Navy: current</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
