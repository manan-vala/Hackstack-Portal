import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, CheckCircle2, Trophy, ChevronRight, Zap, BookOpen, Check } from "lucide-react";
import { Markdown } from "./Markdown";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
  } catch {
  }
  return url;
}
function DailyQuiz({ questions, onSubmit, previousScore, dailyQuizAttempt, userName, moduleColor }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);
  const [viewMode, setViewMode] = useState(dailyQuizAttempt ? "results" : "start");
  const total = questions.reduce((s, q2) => s + q2.points, 0);
  const score = answers.reduce(
    (sum, ans, i) => sum + (ans === questions[i]?.correctIndex ? questions[i].points : 0),
    0
  );
  const handleAnswer = (optionIdx) => {
    const next = [...answers, optionIdx];
    setAnswers(next);
    if (step + 1 < questions.length) {
      setStep((s) => s + 1);
    } else {
      const finalScore = next.reduce(
        (sum, ans, i) => sum + (ans === questions[i]?.correctIndex ? questions[i].points : 0),
        0
      );
      onSubmit(finalScore, next, total);
      setDone(true);
      setViewMode("results");
    }
  };
  if (viewMode === "start") {
    return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
        <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", delay: 0.1 }}
      className={`mx-auto size-16 rounded-full grid place-items-center mb-4 bg-gradient-to-br ${moduleColor} bg-opacity-20`}
    >
          <Zap className="size-8 text-amber-300" />
        </motion.div>
        <div className="text-white mb-1">{questions.length} question{questions.length !== 1 ? "s" : ""}</div>
        <div className="text-slate-400 text-sm mb-6">{total} pts total</div>
        <Button
      onClick={() => setViewMode("quiz")}
      className={`bg-gradient-to-r ${moduleColor} text-white px-8 gap-2`}
    >
          <Zap className="size-4" /> Start Quiz
        </Button>
      </motion.div>;
  }
  if (viewMode === "results" && (done || dailyQuizAttempt)) {
    const attempt = dailyQuizAttempt || { score, totalMarks: total, userAnswers: answers, attemptedAt: (/* @__PURE__ */ new Date()).toISOString() };
    const totalMarks = attempt.totalMarks || total;
    if (!attempt.userAnswers || attempt.userAnswers.length !== questions.length) {
      return <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="text-center py-6 border-b border-white/10">
            {userName && <div className="text-xs text-slate-500 mb-3">
                Results for <span className="text-white font-medium">{userName}</span>
              </div>}
            <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
        className="mx-auto size-16 rounded-full grid place-items-center mb-4 bg-indigo-500/20"
      >
              <Trophy className="size-8 text-indigo-300" />
            </motion.div>
            <div className="text-3xl text-white mb-1">{attempt.score} / {totalMarks} pts</div>
            <p className="text-slate-400 text-sm mb-4">Quiz completed.</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300">Correct Answers</h4>
            {questions.map((q2, idx) => <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="size-6 rounded-full grid place-items-center shrink-0 bg-emerald-500/20">
                    <Check className="size-4 text-emerald-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white mb-2">Q{idx + 1}: {q2.question}</p>
                    <div className="text-xs px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200">
                      <span className="font-semibold">Correct Answer:</span> {q2.options[q2.correctIndex]}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{q2.points} points</div>
                  </div>
                </div>
              </div>)}
          </div>
        </motion.div>;
    }
    return <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
        <div className="text-center py-6 border-b border-white/10">
          {userName && <div className="text-xs text-slate-500 mb-3">
              Results for <span className="text-white font-medium">{userName}</span>
            </div>}
          <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", delay: 0.1 }}
      className="mx-auto size-16 rounded-full grid place-items-center mb-4 bg-indigo-500/20"
    >
            <Trophy className="size-8 text-indigo-300" />
          </motion.div>
          <div className="text-3xl text-white mb-1">{attempt.score} / {totalMarks} pts</div>
          <p className="text-slate-400 text-sm mb-4">Quiz completed.</p>
          {previousScore !== void 0 && attempt.score > previousScore && !dailyQuizAttempt && <div className="inline-flex items-center gap-1.5 text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1.5 rounded-full mb-4">
              <Zap className="size-3.5" /> +{attempt.score - previousScore} pts earned
            </div>}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Answer Review</h4>
          {questions.map((q2, idx) => {
      const userAnswer = attempt.userAnswers[idx];
      const isCorrect = userAnswer === q2.correctIndex;
      return <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`size-6 rounded-full grid place-items-center shrink-0 ${isCorrect ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                    {isCorrect ? <Check className="size-4 text-emerald-300" /> : <X className="size-4 text-rose-300" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white mb-2">Q{idx + 1}: {q2.question}</p>
                    <div className="space-y-1.5">
                      <div className={`text-xs px-3 py-2 rounded-lg ${isCorrect ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-200" : "bg-white/5 border border-white/10 text-slate-300"}`}>
                        <span className="font-semibold">Correct Answer:</span> {q2.options[q2.correctIndex]}
                      </div>
                      {!isCorrect && <div className="text-xs px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-200">
                          <span className="font-semibold">Your Answer:</span> {q2.options[userAnswer]}
                        </div>}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{q2.points} points</div>
                  </div>
                </div>
              </div>;
    })}
        </div>
      </motion.div>;
  }
  const q = questions[step];
  return <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span>Question {step + 1} of {questions.length}</span>
        <span>{total} pts total</span>
      </div>
      <Progress value={step / questions.length * 100} className="h-1 bg-white/10" />
      <AnimatePresence mode="wait">
        <motion.div
    key={step}
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -16 }}
    transition={{ duration: 0.2 }}
  >
          <p className="text-white mb-4">{q.question}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {q.options.map((opt, i) => <motion.button
    key={i}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => handleAnswer(i)}
    className="text-left px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-indigo-400 hover:bg-indigo-500/10 text-slate-200 text-sm transition-colors"
  >
                <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </motion.button>)}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>;
}
function DayModal({ chapter, moduleColor, isCompleted, dailyScore, dailyQuizAttempt, userName, onClose, onComplete }) {
  const [quizDone, setQuizDone] = useState(isCompleted);
  const hasQuiz = (chapter.quiz?.length ?? 0) > 0;
  const [activeTab, setActiveTab] = useState("content");
  const handleQuizSubmit = (score, userAnswers, totalMarks) => {
    setQuizDone(true);
    onComplete(chapter.id, score, userAnswers, totalMarks);
  };
  return <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/70 backdrop-blur-sm"
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
      <motion.div
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    transition={{ type: "spring", damping: 28, stiffness: 220 }}
    className="relative w-full max-w-2xl bg-slate-950 border-l border-white/10 flex flex-col overflow-hidden"
  >
        {
    /* Header */
  }
        <div className={`bg-gradient-to-r ${moduleColor} p-5 flex items-start justify-between shrink-0`}>
          <div>
            <div className="text-white/70 text-xs uppercase tracking-widest mb-1">Day {chapter.day}</div>
            <h2 className="text-white leading-snug">{chapter.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              {chapter.videoUrl && <Badge className="bg-black/20 text-white/80 border-0 gap-1 text-xs">
                  <Play className="size-3" /> Video
                </Badge>}
              {hasQuiz && <Badge className="bg-black/20 text-white/80 border-0 gap-1 text-xs">
                  <Zap className="size-3" /> {chapter.quiz.length} questions
                </Badge>}
              {isCompleted && <Badge className="bg-emerald-500/30 text-emerald-200 border-0 gap-1 text-xs">
                  <CheckCircle2 className="size-3" /> Completed
                </Badge>}
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors mt-1">
            <X className="size-5" />
          </button>
        </div>

        {
    /* Tabs */
  }
        {hasQuiz && <div className="flex border-b border-white/10 bg-slate-900 shrink-0">
            {["content", "quiz"].map((tab) => <button
    key={tab}
    onClick={() => setActiveTab(tab)}
    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${activeTab === tab ? "text-white border-b-2 border-indigo-400" : "text-slate-400 hover:text-slate-200"}`}
  >
                {tab === "content" ? <BookOpen className="size-4" /> : <Zap className="size-4" />}
                {tab === "content" ? "Content & Goals" : "Daily Quiz"}
                {tab === "quiz" && quizDone && <CheckCircle2 className="size-3.5 text-emerald-400" />}
              </button>)}
          </div>}

        {
    /* Scrollable body */
  }
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "content" ? <motion.div
    key="content"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="p-6 space-y-6"
  >
                {
    /* YouTube embed */
  }
                {chapter.videoUrl && <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video">
                    <iframe
    src={toEmbedUrl(chapter.videoUrl)}
    className="w-full h-full"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
                  </div>}

                {
    /* Markdown content */
  }
                <div className="prose-invert">
                  <Markdown source={chapter.contentMarkdown} />
                </div>

                {
    /* CTA to quiz */
  }
                {hasQuiz && !quizDone && <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className={`rounded-2xl border border-white/10 bg-gradient-to-r ${moduleColor} bg-opacity-10 p-5 flex items-center justify-between`}
  >
                    <div>
                      <div className="text-white">Ready to test yourself?</div>
                      <div className="text-sm text-white/60 mt-0.5">{chapter.quiz.length} questions · complete to mark day done</div>
                    </div>
                    <Button
    onClick={() => setActiveTab("quiz")}
    className="bg-white/20 hover:bg-white/30 text-white gap-1 shrink-0"
  >
                      Take Quiz <ChevronRight className="size-4" />
                    </Button>
                  </motion.div>}
              </motion.div> : <motion.div
    key="quiz"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="p-6"
  >
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Zap className="size-4 text-amber-400" />
                    <span className="text-white">Day {chapter.day} Quiz</span>
                    {dailyScore !== void 0 && <Badge className="ml-auto bg-indigo-500/20 text-indigo-200 border-0">
                        Best: {dailyScore} pts
                      </Badge>}
                  </div>
                  <DailyQuiz
    questions={chapter.quiz}
    onSubmit={handleQuizSubmit}
    previousScore={dailyScore}
    dailyQuizAttempt={dailyQuizAttempt}
    userName={userName}
    moduleColor={moduleColor}
  />
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>;
}
export {
  DayModal
};
