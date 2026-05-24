import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  Zap,
  Trophy,
  X,
  Check,
  BookOpen,
  Code2,
  Palette,
  Braces,
  Layers,
  BarChart2,
  FolderGit2,
  ExternalLink,
  Send
} from "lucide-react";
import { useStore } from "../store";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Markdown } from "../components/Markdown";
import { DayModal } from "../components/DayModal";
const STACK_ICONS = {
  "html-foundations": Code2,
  "css-mastery": Palette,
  "javascript-essentials": Braces,
  "react-modern-dev": Layers
};
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
function ModuleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { progress, markChapter, submitFinalAttempt, submitDailyQuiz, modules, user } = useStore();
  const m = useMemo(() => modules.find((x) => x.slug === slug), [slug, modules]);
  const [openChapter, setOpenChapter] = useState(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [cumulativeOpen, setCumulativeOpen] = useState(false);
  if (!m) {
    return <div className="max-w-2xl mx-auto text-center py-20 text-white">
        <h2>Course not found</h2>
        <Button asChild className="mt-4"><Link to="/modules">Back to catalog</Link></Button>
      </div>;
  }
  const isRegistered = user.registeredModules.includes(m.id);
  const pr = progress.find((p) => p.moduleId === m.id);
  const completedSet = new Set(pr?.completedChapters ?? []);
  const chaptersDone = pr?.completedChapters.length ?? 0;
  const allDaysComplete = chaptersDone >= m.chapters.length;
  const finalAttempt = pr?.finalAttempt;
  const finalDone = !!finalAttempt;
  const pct = Math.round((chaptersDone + (finalDone ? 1 : 0)) / (m.chapters.length + 1) * 100);
  const Icon = STACK_ICONS[m.slug] ?? BookOpen;
  const isQuizAssessment = m.assessment.type === "quiz";
  const assessmentLabel = isQuizAssessment ? "Final Quiz" : "Submit Project";
  return <div className="-m-6 md:-m-10 p-6 md:p-10 min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto pb-10">

        {
    /* Back button */
  }
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={() => navigate("/modules")} className="text-slate-600 hover:text-slate-900 -ml-3 mb-6 gap-1">
            <ArrowLeft className="size-4" /> All courses
          </Button>
        </motion.div>

        {
    /* Course hero */
  }
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl mb-8 shadow-sm">
          <div className={`bg-gradient-to-br ${m.color} p-8 md:p-10`}>
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize: "22px 22px" }} />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="size-16 rounded-2xl bg-white/25 backdrop-blur grid place-items-center shrink-0">
                <Icon className="size-9 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className="bg-black/20 text-white/90 border-0">Module {m.week}</Badge>
                  {finalDone && chaptersDone === m.chapters.length && <Badge className="bg-white/25 text-white border-0 gap-1"><CheckCircle2 className="size-3" /> Completed</Badge>}
                </div>
                <h1 className="text-white tracking-tight">{m.title}</h1>
                <p className="text-white/75 mt-1">{m.description}</p>
              </div>
              <div className="md:text-right shrink-0">
                <div className="text-white/70 text-sm mb-1">{pct}% complete</div>
                <div className="w-full md:w-40 h-2 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${pct}%` }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="h-full bg-white/85 rounded-full"
  />
                </div>
                <div className="text-white/55 text-xs mt-1">{chaptersDone}/{m.chapters.length} days done</div>
              </div>
            </div>
          </div>
        </motion.div>

        {
    /* Not registered warning */
  }
        {!isRegistered && <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-800 text-sm flex items-center gap-3"
  >
            <Lock className="size-4 shrink-0" />
            You are not enrolled in this course. Go to the{" "}
            <Link to="/modules" className="underline underline-offset-2 hover:text-amber-900">course catalog</Link> to register.
          </motion.div>}

        {
    /* Section header */
  }
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-slate-800 tracking-tight">Daily Tasks</h2>
          <div className="flex items-center gap-2">
            <Button
    variant="outline"
    onClick={() => setCumulativeOpen(true)}
    className="gap-2 border-slate-200 text-slate-600 hover:text-slate-900"
  >
              <BarChart2 className="size-4" />
              View Full Results
            </Button>
            <Button
    onClick={() => setAssessmentOpen(true)}
    disabled={!allDaysComplete}
    className={`gap-2 text-white ${allDaysComplete ? `bg-gradient-to-r ${m.color} hover:opacity-90` : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
  >
              {isQuizAssessment ? <Trophy className="size-4" /> : <Send className="size-4" />}
              {assessmentLabel}
              {!allDaysComplete && <span className="text-xs">({m.chapters.length - chaptersDone} days left)</span>}
            </Button>
          </div>
        </div>

        {
    /* Day cards grid */
  }
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {m.chapters.map((chapter, i) => {
    const done = completedSet.has(chapter.id);
    const locked = !isRegistered || i > 0 && !completedSet.has(m.chapters[i - 1].id);
    const isNext = !done && !locked;
    const hasVideo = !!chapter.videoUrl;
    const hasQuiz = (chapter.quiz?.length ?? 0) > 0;
    const dailyScore = pr?.dailyScores?.[chapter.id];
    return <motion.div key={chapter.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={locked ? {} : { y: -3 }} className="group">
                <div
      onClick={() => !locked && setOpenChapter(chapter)}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer h-full flex flex-col shadow-sm
                    ${done ? "border-emerald-200 bg-emerald-50 hover:shadow-md" : isNext ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md" : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"}`}
    >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${m.color} ${done ? "opacity-100" : "opacity-50"}`} />
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${done ? "bg-emerald-100 text-emerald-700" : isNext ? "bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-400"}`}>Day {chapter.day}</span>
                      {done ? <CheckCircle2 className="size-5 text-emerald-500" /> : locked ? <Lock className="size-4 text-slate-300" /> : <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className={`size-2 rounded-full bg-gradient-to-br ${m.color}`} />}
                    </div>
                    <h3 className={`leading-snug ${done ? "text-slate-700" : isNext ? "text-slate-900" : "text-slate-400"}`}>{chapter.title}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 flex-1">
                      {chapter.contentMarkdown.replace(/#{1,6}\s/g, "").replace(/\*\*/g, "").split("\n").find((l) => l.trim().length > 20) ?? ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {hasVideo && <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          <Play className="size-2.5" /> Video
                        </span>}
                      {hasQuiz && <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          <Zap className="size-2.5" /> {chapter.quiz.length}Q Quiz
                        </span>}
                      {dailyScore !== void 0 && <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                          <Trophy className="size-2.5" /> {dailyScore} pts
                        </span>}
                    </div>
                    {!locked && <div className={`text-xs flex items-center gap-1 mt-1 ${done ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-700 transition-colors"}`}>
                        {done ? "Review day" : "Open day"} →
                      </div>}
                  </div>
                </div>
              </motion.div>;
  })}

          {
    /* Final assessment card */
  }
          {m.showFinalAssessment ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: m.chapters.length * 0.06 }}
              whileHover={allDaysComplete ? { y: -3 } : {}}
              className="group"
            >
              <div
                onClick={() => allDaysComplete && setAssessmentOpen(true)}
                className={`relative overflow-hidden rounded-2xl border h-full flex flex-col transition-all duration-200 shadow-sm
                  ${finalDone ? isQuizAssessment ? "border-amber-200 bg-amber-50 cursor-pointer hover:shadow-md" : "border-violet-200 bg-violet-50 cursor-pointer hover:shadow-md" : allDaysComplete ? "border-slate-200 bg-white cursor-pointer hover:border-amber-300 hover:shadow-md" : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"}`}
              >
                <div className={`h-1.5 w-full ${isQuizAssessment ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-violet-500 to-purple-600"} ${finalDone ? "opacity-100" : "opacity-40"}`} />
                <div className="p-5 flex flex-col items-center justify-center gap-3 text-center flex-1 min-h-[180px]">
                  <div className={`size-12 rounded-2xl grid place-items-center ${finalDone ? isQuizAssessment ? "bg-amber-100" : "bg-violet-100" : "bg-slate-100"}`}>
                    {isQuizAssessment ? <Trophy className={`size-6 ${finalDone ? "text-amber-500" : allDaysComplete ? "text-slate-500" : "text-slate-300"}`} /> : <FolderGit2 className={`size-6 ${finalDone ? "text-violet-500" : allDaysComplete ? "text-slate-500" : "text-slate-300"}`} />}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${finalDone ? isQuizAssessment ? "text-amber-700" : "text-violet-700" : allDaysComplete ? "text-slate-800" : "text-slate-400"}`}>
                      {isQuizAssessment ? "Final Assessment" : "Project Submission"}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {finalDone ? finalAttempt.type === "quiz" ? `${finalAttempt.score} / ${finalAttempt.totalMarks} pts` : "Submitted" : allDaysComplete ? isQuizAssessment ? `${m.assessment.questions.length} questions` : "Ready to submit" : `Complete all ${m.chapters.length} days first`}
                    </div>
                  </div>
                  {finalDone && finalAttempt.type === "project" && <a
                    href={finalAttempt.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 underline underline-offset-2"
                  >
                    <ExternalLink className="size-3" /> View repo
                  </a>}
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>

        {
    /* Final Task section */
  }
        {m.showFinalAssessment ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (m.chapters.length + 1) * 0.06 }}
            className="mt-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`size-8 rounded-xl bg-gradient-to-br ${m.color} grid place-items-center shrink-0`}>
                <BookOpen className="size-4 text-white" />
              </div>
              <h2 className="text-slate-800 tracking-tight">Final Task</h2>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className={`h-1.5 w-full bg-gradient-to-r ${m.color}`} />
              <div className="p-6 md:p-8">
                <Markdown source={m.finalTask ?? ""} />
              </div>
            </div>
          </motion.div>
        ) : null}

        {
    /* Day modal */
  }
        <AnimatePresence>
          {openChapter && <DayModal
    chapter={openChapter}
    moduleColor={m.color}
    moduleId={m.id}
    isCompleted={completedSet.has(openChapter.id)}
    dailyScore={pr?.dailyScores?.[openChapter.id]}
    dailyQuizAttempt={pr?.dailyQuizAttempts?.[openChapter.id]}
    userName={user.username}
    onClose={() => setOpenChapter(null)}
    onComplete={(chapterId, score, userAnswers, totalMarks) => {
      submitDailyQuiz(m.id, chapterId, score, userAnswers, totalMarks);
      if (score > 0) markChapter(m.id, chapterId);
    }}
  />}
        </AnimatePresence>

        {
    /* Cumulative daily results dialog */
  }
        <CumulativeResultsDialog
    open={cumulativeOpen}
    onClose={() => setCumulativeOpen(false)}
    moduleColor={m.color}
    chapters={m.chapters}
    dailyScores={pr?.dailyScores}
    dailyQuizAttempts={pr?.dailyQuizAttempts}
  />

        {
    /* Final assessment dialog — quiz or project */
  }
        {isQuizAssessment ? <QuizDialog
    open={assessmentOpen}
    onClose={() => setAssessmentOpen(false)}
    moduleColor={m.color}
    questions={m.assessment.questions}
    finalAttempt={finalAttempt?.type === "quiz" ? finalAttempt : void 0}
    userName={user.username}
    onSubmit={(score, userAnswers, totalMarks) => submitFinalAttempt(m.id, { type: "quiz", score, totalMarks, userAnswers, attemptedAt: (/* @__PURE__ */ new Date()).toISOString() })}
  /> : <ProjectDialog
    open={assessmentOpen}
    onClose={() => setAssessmentOpen(false)}
    moduleColor={m.color}
    prompt={m.assessment.prompt}
    finalAttempt={finalAttempt?.type === "project" ? finalAttempt : void 0}
    onSubmit={(repoUrl, liveUrl, notes) => submitFinalAttempt(m.id, { type: "project", repoUrl, liveUrl, notes, submittedAt: (/* @__PURE__ */ new Date()).toISOString() })}
  />}
      </div>
    </div>;
}
function CumulativeResultsDialog({
  open,
  onClose,
  moduleColor,
  chapters,
  dailyScores,
  dailyQuizAttempts
}) {
  const chaptersWithQuiz = chapters.filter((c) => (c.quiz?.length ?? 0) > 0);
  const totalPossible = chaptersWithQuiz.reduce((sum, c) => sum + c.quiz.reduce((s, q) => s + q.points, 0), 0);
  const totalEarned = chaptersWithQuiz.reduce((sum, c) => sum + (dailyScores?.[c.id] ?? 0), 0);
  const attemptedCount = chaptersWithQuiz.filter((c) => dailyScores?.[c.id] !== void 0).length;
  return <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-950 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart2 className="size-5 text-indigo-400" />
            Daily Quiz Results
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Cumulative scores across all module days · {attemptedCount} of {chaptersWithQuiz.length} quizzes taken
          </DialogDescription>
        </DialogHeader>

        <div className={`rounded-2xl bg-gradient-to-br ${moduleColor} p-5 text-center`}>
          <div className="text-white/70 text-sm mb-1">Total Score</div>
          <div className="text-4xl text-white">{totalEarned} / {totalPossible} pts</div>
          {totalPossible > 0 && <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden mt-3">
              <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${Math.round(totalEarned / totalPossible * 100)}%` }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="h-full bg-white/80 rounded-full"
  />
            </div>}
          <div className="text-white/60 text-xs mt-2">
            {totalPossible > 0 ? Math.round(totalEarned / totalPossible * 100) : 0}% of total daily marks
          </div>
        </div>

        <div className="space-y-2 mt-2">
          {chaptersWithQuiz.map((chapter, i) => {
    const score = dailyScores?.[chapter.id];
    const quizTotal = chapter.quiz.reduce((s, q) => s + q.points, 0);
    const attempted = score !== void 0;
    const pct = attempted ? Math.round(score / quizTotal * 100) : 0;
    return <motion.div
      key={chapter.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className={`rounded-xl border p-4 ${attempted ? "border-white/10 bg-white/5" : "border-white/5 bg-white/[0.02]"}`}
    >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-slate-500 shrink-0">Day {chapter.day}</span>
                    <span className="text-sm text-slate-200 truncate">{chapter.title}</span>
                  </div>
                  <div className="text-sm shrink-0 ml-3">
                    {attempted ? <span className="text-white">{score} / {quizTotal} pts</span> : <span className="text-slate-600">Not attempted</span>}
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.04 }}
      className={`h-full rounded-full bg-gradient-to-r ${moduleColor}`}
    />
                </div>
                {attempted && <div className="text-xs text-slate-500 mt-1 text-right">{pct}%</div>}
              </motion.div>;
  })}
        </div>

        <div className="flex justify-end pt-2 border-t border-white/10 mt-2">
          <Button onClick={onClose} className={`bg-gradient-to-r ${moduleColor}`}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>;
}
function QuizDialog({
  open,
  onClose,
  moduleColor,
  questions,
  finalAttempt,
  userName,
  onSubmit
}) {
  const [viewMode, setViewMode] = useState("start");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submittedAttempt, setSubmittedAttempt] = useState(void 0);
  const total = questions.reduce((s, q) => s + q.points, 0);
  const activeAttempt = submittedAttempt ?? finalAttempt;
  const reset = () => {
    setViewMode(finalAttempt ? "results" : "start");
    setStep(0);
    setAnswers([]);
    setSubmittedAttempt(void 0);
  };
  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };
  const startQuiz = () => {
    setViewMode("quiz");
    setStep(0);
    setAnswers([]);
  };
  if (!questions.length) return null;
  if (viewMode === "start" && activeAttempt) {
    setViewMode("results");
  }
  return <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-slate-950 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-400" />
            {viewMode === "start" ? "Final Assessment" : viewMode === "quiz" ? `Question ${step + 1} of ${questions.length}` : "Assessment Results"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {viewMode === "start" ? "Test your knowledge for this module." : viewMode === "quiz" ? "Pick the best answer." : "Your final assessment results."}
          </DialogDescription>
        </DialogHeader>

        {viewMode === "start" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <div className="mx-auto size-20 rounded-full bg-indigo-500/20 grid place-items-center mb-4">
              <Trophy className="size-10 text-indigo-300" />
            </div>
            <h3 className="text-xl mb-2">Ready for the final quiz?</h3>
            <p className="text-slate-400 mb-1">{questions.length} questions</p>
            <p className="text-slate-400 mb-6">Total marks: {total}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose} className="bg-transparent border-white/20">Cancel</Button>
              <Button onClick={startQuiz} className={`bg-gradient-to-r ${moduleColor}`}>Start Quiz</Button>
            </div>
          </motion.div>}

        {viewMode === "quiz" && <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Progress value={step / questions.length * 100} className="h-1 bg-white/10 mb-5" />
            <p className="text-lg mb-4">{questions[step].question}</p>
            <div className="space-y-2">
              {questions[step].options.map((opt, i) => <motion.button
    key={i}
    whileHover={{ x: 3 }}
    onClick={() => {
      const next = [...answers, i];
      setAnswers(next);
      if (step + 1 < questions.length) {
        setStep((s) => s + 1);
      } else {
        const finalScore = next.reduce(
          (sum, ans, idx) => sum + (ans === questions[idx]?.correctIndex ? questions[idx].points : 0),
          0
        );
        const attempt = {
          type: "quiz",
          score: finalScore,
          totalMarks: total,
          userAnswers: next,
          attemptedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        onSubmit(finalScore, next, total);
        setSubmittedAttempt(attempt);
        setViewMode("results");
      }
    }}
    className="w-full text-left px-4 py-3 rounded-xl border border-white/10 hover:border-indigo-400 hover:bg-indigo-500/10 transition-colors text-slate-200"
  >
                  <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </motion.button>)}
            </div>
          </motion.div>}

        {viewMode === "results" && activeAttempt && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-4">
            <div className="text-center py-6 border-b border-white/10 mb-6">
              {userName && <div className="text-sm text-slate-500 mb-3">
                  Results for <span className="text-white font-medium">{userName}</span>
                </div>}
              <motion.div
    initial={{ scale: 0, rotate: -10 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", damping: 10, stiffness: 200 }}
    className="mx-auto size-20 rounded-full grid place-items-center mb-4 bg-indigo-500/20"
  >
                <Trophy className="size-10 text-indigo-300" />
              </motion.div>
              <div className="text-4xl tracking-tight mb-2">{activeAttempt.score} / {activeAttempt.totalMarks} pts</div>
              <p className="text-slate-400">
                {Math.round(activeAttempt.score / activeAttempt.totalMarks * 100)}% · Quiz completed
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-slate-300">Answer Review</h4>
              {questions.map((q, qIdx) => {
    const userAnswer = activeAttempt.userAnswers[qIdx];
    const hasAnswer = userAnswer !== void 0;
    const isCorrect = userAnswer === q.correctIndex;
    return <div key={qIdx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`size-6 rounded-full grid place-items-center shrink-0 ${isCorrect ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                        {isCorrect ? <Check className="size-4 text-emerald-300" /> : <X className="size-4 text-rose-300" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm mb-2">{q.question}</p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
      const isUserAnswer = hasAnswer && userAnswer === optIdx;
      const isCorrectAnswer = q.correctIndex === optIdx;
      return <div
        key={optIdx}
        className={`text-xs px-3 py-2 rounded-lg ${isCorrectAnswer ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-200" : isUserAnswer ? "bg-rose-500/20 border border-rose-500/30 text-rose-200" : "bg-white/5 border border-white/5 text-slate-400"}`}
      >
                                <span className="font-medium mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                                {opt}
                                {isCorrectAnswer && <span className="ml-2 text-emerald-300">✓ Correct</span>}
                                {isUserAnswer && !isCorrectAnswer && <span className="ml-2 text-rose-300">Your answer</span>}
                              </div>;
    })}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">{q.points} points</div>
                      </div>
                    </div>
                  </div>;
  })}
            </div>

            <div className="flex gap-2 justify-center pt-4 border-t border-white/10">
              <Button onClick={handleClose} className={`bg-gradient-to-r ${moduleColor}`}>Done</Button>
            </div>
          </motion.div>}
      </DialogContent>
    </Dialog>;
}
function ProjectDialog({
  open,
  onClose,
  moduleColor,
  prompt,
  finalAttempt,
  onSubmit
}) {
  const [repoUrl, setRepoUrl] = useState(finalAttempt?.repoUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(finalAttempt?.liveUrl ?? "");
  const [notes, setNotes] = useState(finalAttempt?.notes ?? "");
  const [submitted, setSubmitted] = useState(false);
  const handleClose = () => {
    onClose();
    if (!finalAttempt) {
      setTimeout(() => {
        setRepoUrl("");
        setLiveUrl("");
        setNotes("");
        setSubmitted(false);
      }, 300);
    }
  };
  const handleSubmit = () => {
    if (!repoUrl.trim()) return;
    onSubmit(repoUrl.trim(), liveUrl.trim(), notes.trim());
    setSubmitted(true);
  };
  const isSubmitted = !!finalAttempt || submitted;
  const displayRepo = finalAttempt?.repoUrl ?? repoUrl;
  const displayLive = finalAttempt?.liveUrl ?? liveUrl;
  const displayNotes = finalAttempt?.notes ?? notes;
  return <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-slate-950 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderGit2 className="size-5 text-violet-400" />
            {isSubmitted ? "Project Submitted" : "Submit Your Project"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isSubmitted ? "Your project has been submitted successfully." : prompt}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 py-2">
            <div className="flex justify-center">
              <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", damping: 12, stiffness: 200 }}
    className="size-20 rounded-full bg-violet-500/20 grid place-items-center"
  >
                <CheckCircle2 className="size-10 text-violet-300" />
              </motion.div>
            </div>
            <p className="text-center text-slate-300">Great work! Your project submission is in.</p>

            <div className="space-y-3 bg-white/5 rounded-2xl border border-white/10 p-5">
              <div>
                <div className="text-xs text-slate-500 mb-1">Repository URL</div>
                <a
    href={displayRepo}
    target="_blank"
    rel="noopener noreferrer"
    className="text-violet-300 hover:text-violet-200 text-sm flex items-center gap-1.5 break-all"
  >
                  <FolderGit2 className="size-3.5 shrink-0" />
                  {displayRepo}
                </a>
              </div>
              {displayLive && <div>
                  <div className="text-xs text-slate-500 mb-1">Live Demo</div>
                  <a
    href={displayLive}
    target="_blank"
    rel="noopener noreferrer"
    className="text-violet-300 hover:text-violet-200 text-sm flex items-center gap-1.5 break-all"
  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    {displayLive}
                  </a>
                </div>}
              {displayNotes && <div>
                  <div className="text-xs text-slate-500 mb-1">Notes</div>
                  <p className="text-slate-300 text-sm">{displayNotes}</p>
                </div>}
            </div>

            <div className="flex justify-center pt-2">
              <Button onClick={handleClose} className={`bg-gradient-to-r ${moduleColor}`}>Close</Button>
            </div>
          </motion.div> : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Repository URL <span className="text-rose-400">*</span></label>
              <input
    type="url"
    value={repoUrl}
    onChange={(e) => setRepoUrl(e.target.value)}
    placeholder="https://github.com/username/project"
    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-400 text-sm transition-colors"
  />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-300">Live Demo URL <span className="text-slate-500">(optional)</span></label>
              <input
    type="url"
    value={liveUrl}
    onChange={(e) => setLiveUrl(e.target.value)}
    placeholder="https://your-project.vercel.app"
    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-400 text-sm transition-colors"
  />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-300">Notes <span className="text-slate-500">(optional)</span></label>
              <textarea
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    rows={3}
    placeholder="Anything you'd like to share about your project..."
    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-400 text-sm resize-none transition-colors"
  />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-white/10">
              <Button variant="outline" onClick={handleClose} className="bg-transparent border-white/20">Cancel</Button>
              <Button
    onClick={handleSubmit}
    disabled={!repoUrl.trim()}
    className={`gap-2 ${repoUrl.trim() ? `bg-gradient-to-r ${moduleColor}` : "bg-white/10 text-slate-500 cursor-not-allowed"}`}
  >
                <Send className="size-4" /> Submit Project
              </Button>
            </div>
          </motion.div>}
      </DialogContent>
    </Dialog>;
}
export {
  ModuleDetail
};
