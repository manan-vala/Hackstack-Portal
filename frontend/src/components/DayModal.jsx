import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Play,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { Markdown } from "./Markdown";

function toEmbedUrl(url) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsedUrl.pathname}`;
    }

    const videoId = parsedUrl.searchParams.get("v");
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    return url;
  }

  return url;
}

function Pill({ children, tone = "muted" }) {
  const tones = {
    muted: "bg-black/20 text-white/80 border-white/0",
    success: "bg-emerald-500/25 text-emerald-100 border-emerald-400/20",
    bright: "bg-white/18 text-white border-white/10",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-white transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function DailyQuiz({
  questions,
  onSubmit,
  previousScore,
  dailyQuizAttempt,
  submitting = false,
  userName,
  moduleTheme,
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);
  const quizAlreadyTaken = Boolean(dailyQuizAttempt);
  const totalMarks = useMemo(
    () => questions.reduce((sum, question) => sum + question.points, 0),
    [questions]
  );
  const [viewMode, setViewMode] = useState(
    quizAlreadyTaken ? "results" : "start"
  );

  const scoreFromAnswers = answers.reduce((sum, answer, index) => {
    const question = questions[index];
    if (!question) return sum;
    return answer === question.correctIndex ? sum + question.points : sum;
  }, 0);

  const resultPayload =
    dailyQuizAttempt || {
      score: scoreFromAnswers,
      totalMarks,
      userAnswers: answers,
      attemptedAt: new Date().toISOString(),
    };

  const handleAnswer = async (optionIndex) => {
    const nextAnswers = [...answers];
    nextAnswers[step] = optionIndex;
    setAnswers(nextAnswers);

    if (step + 1 < questions.length) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    const finalScore = nextAnswers.reduce((sum, answer, index) => {
      const question = questions[index];
      return answer === question.correctIndex ? sum + question.points : sum;
    }, 0);

    await onSubmit(finalScore, nextAnswers, totalMarks);
    setDone(true);
    setViewMode("results");
  };

  if (viewMode === "start") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-6 text-center"
      >
        <div
          className="mx-auto mb-4 grid size-16 place-items-center rounded-full"
          style={{ background: `${moduleTheme.accent}26` }}
        >
          <Zap className="size-8 text-amber-300" />
        </div>
        <div className="mb-1 text-white">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </div>
        <div className="mb-6 text-sm text-slate-400">{totalMarks} pts total</div>
        <button
          type="button"
          disabled={quizAlreadyTaken || submitting}
          onClick={() => setViewMode("quiz")}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: moduleTheme.button }}
        >
          <Zap className="size-4" />
          {quizAlreadyTaken ? "Quiz Completed" : "Start Quiz"}
        </button>
      </motion.div>
    );
  }

  if (viewMode === "results" && (done || quizAlreadyTaken)) {
    const hasAnswerReview =
      Array.isArray(resultPayload.userAnswers) &&
      resultPayload.userAnswers.length === questions.length;

    return (
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-4"
      >
        <div className="border-b border-white/10 py-6 text-center">
          {userName ? (
            <div className="mb-3 text-xs text-slate-500">
              Results for <span className="font-medium text-white">{userName}</span>
            </div>
          ) : null}
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-indigo-500/20">
            <Trophy className="size-8 text-indigo-200" />
          </div>
          <div className="mb-1 text-3xl font-semibold text-white">
            {resultPayload.score} / {resultPayload.totalMarks || totalMarks} pts
          </div>
          <p className="mb-4 text-sm text-slate-400">Quiz completed.</p>
          {previousScore !== undefined &&
          resultPayload.score > previousScore &&
          !dailyQuizAttempt ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300">
              <Zap className="size-3.5" />
              +{resultPayload.score - previousScore} pts earned
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-300">
            {hasAnswerReview ? "Answer Review" : "Correct Answers"}
          </h4>

          {questions.map((question, questionIndex) => {
            const userAnswer = resultPayload.userAnswers?.[questionIndex];
            const isCorrect = hasAnswerReview
              ? userAnswer === question.correctIndex
              : true;

            return (
              <div
                key={questionIndex}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-3 flex items-start gap-3">
                  <div
                    className={`grid size-6 shrink-0 place-items-center rounded-full ${
                      isCorrect ? "bg-emerald-500/20" : "bg-rose-500/20"
                    }`}
                  >
                    {isCorrect ? (
                      <Check className="size-4 text-emerald-300" />
                    ) : (
                      <X className="size-4 text-rose-300" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="mb-2 text-sm text-white">
                      Q{questionIndex + 1}: {question.question}
                    </p>
                    <div className="space-y-1.5">
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-2 text-xs text-emerald-100">
                        <span className="font-semibold">Correct Answer:</span>{" "}
                        {question.options[question.correctIndex]}
                      </div>
                      {hasAnswerReview && !isCorrect ? (
                        <div className="rounded-lg border border-rose-500/30 bg-rose-500/20 px-3 py-2 text-xs text-rose-100">
                          <span className="font-semibold">Your Answer:</span>{" "}
                          {question.options[userAnswer]}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {question.points} points
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  const activeQuestion = questions[step];

  return (
    <div className="space-y-4">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>
          Question {step + 1} of {questions.length}
        </span>
        <span>{totalMarks} pts total</span>
      </div>

      <ProgressBar value={((step + 1) / questions.length) * 100} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          <p className="mb-4 text-white">{activeQuestion.question}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {activeQuestion.options.map((option, optionIndex) => (
              <button
                key={optionIndex}
                type="button"
                onClick={() => handleAnswer(optionIndex)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition-colors hover:border-indigo-400 hover:bg-indigo-500/10"
              >
                <span className="mr-2 text-slate-500">
                  {String.fromCharCode(65 + optionIndex)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DayModal({
  chapter,
  moduleTheme,
  isCompleted,
  dailyScore,
  dailyQuizAttempt,
  userName,
  onClose,
  onComplete,
  submitting = false,
}) {
  const [locallyCompleted, setLocallyCompleted] = useState(false);
  const hasQuiz = (chapter.quiz?.length ?? 0) > 0;
  const [activeTab, setActiveTab] = useState("content");
  const quizDone = locallyCompleted || isCompleted || Boolean(dailyQuizAttempt);

  const handleQuizSubmit = async (score, userAnswers, totalMarks) => {
    if (dailyQuizAttempt || submitting) return;

    await onComplete(chapter.id, score, userAnswers, totalMarks);
    setLocallyCompleted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-950/72 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-white/10 bg-slate-950"
      >
        <div
          className="shrink-0 p-5"
          style={{
            background: `${moduleTheme.banner}, radial-gradient(circle at top right, ${moduleTheme.dot} 1px, transparent 1px)`,
            backgroundSize: "auto, 14px 14px",
            boxShadow: `inset 0 -1px 0 rgba(255, 255, 255, 0.08), 0 12px 40px ${moduleTheme.bannerShadow}`,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-xs uppercase tracking-[0.28em] text-white/70">
                Day {chapter.day}
              </div>
              <h2 className="leading-snug text-white">{chapter.title}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {chapter.videoUrl ? (
                  <Pill>
                    <Play className="size-3" />
                    Video
                  </Pill>
                ) : null}
                {hasQuiz ? (
                  <Pill>
                    <Zap className="size-3" />
                    {chapter.quiz.length} questions
                  </Pill>
                ) : null}
                {isCompleted ? (
                  <Pill tone="success">
                    <CheckCircle2 className="size-3" />
                    Completed
                  </Pill>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-1 text-white/70 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {hasQuiz ? (
          <div className="flex shrink-0 border-b border-white/10 bg-slate-900">
            {[
              { key: "content", label: "Content & Goals", icon: BookOpen },
              { key: "quiz", label: "Daily Quiz", icon: Zap },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                  activeTab === key
                    ? "border-b-2 border-cyan-400 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="size-4" />
                {label}
                {key === "quiz" && quizDone ? (
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "content" ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 p-6"
              >
                {chapter.videoUrl ? (
                  <div className="aspect-video overflow-hidden rounded-2xl border border-white/10">
                    <iframe
                      src={toEmbedUrl(chapter.videoUrl)}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${chapter.title} video`}
                    />
                  </div>
                ) : null}

                <div>
                  <Markdown source={chapter.contentMarkdown} tone="dark" />
                </div>

                {hasQuiz && !quizDone ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 p-5"
                    style={{ background: `${moduleTheme.accent}14` }}
                  >
                    <div>
                      <div className="text-white">Ready to test yourself?</div>
                      <div className="mt-0.5 text-sm text-slate-300">
                        {chapter.quiz.length} questions. Completing the quiz will
                        mark this day done.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("quiz")}
                      className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/16"
                    >
                      Take Quiz
                      <ChevronRight className="size-4" />
                    </button>
                  </motion.div>
                ) : null}

                {!hasQuiz && !quizDone ? (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={async () => {
                      await onComplete(chapter.id, null, null, null);
                      setLocallyCompleted(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: moduleTheme.button }}
                  >
                    <CheckCircle2 className="size-4" />
                    Mark day complete
                  </button>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Zap className="size-4 text-amber-400" />
                    <span className="text-white">Day {chapter.day} Quiz</span>
                    {dailyScore !== undefined ? (
                      <Pill tone="bright">Best: {dailyScore} pts</Pill>
                    ) : null}
                  </div>

                  <DailyQuiz
                    questions={chapter.quiz}
                    onSubmit={handleQuizSubmit}
                    previousScore={dailyScore}
                    dailyQuizAttempt={dailyQuizAttempt}
                    submitting={submitting}
                    userName={userName}
                    moduleTheme={moduleTheme}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { DayModal };
