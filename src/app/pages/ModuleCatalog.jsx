import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Code2, Palette, Braces, Layers, CheckCircle2, Lock, Play, BookOpen, Zap, ArrowRight, X, ChevronDown, ChevronUp, Wrench, Tag } from "lucide-react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useStore } from "../store";
const STACK_ICONS = {
  "html-foundations": Code2,
  "css-mastery": Palette,
  "javascript-essentials": Braces,
  "react-modern-dev": Layers
};
const STACK_LABELS = {
  "html-foundations": "HTML",
  "css-mastery": "CSS",
  "javascript-essentials": "JavaScript",
  "react-modern-dev": "React"
};
function ModuleCatalog() {
  const { modules, progress, user, registerModule, unregisterModule } = useStore();
  const registered = user.registeredModules;
  const [confirmUnreg, setConfirmUnreg] = useState(null);
  const [expandedInfo, setExpandedInfo] = useState(null);
  return <div className="-m-6 md:-m-10 p-6 md:p-10 min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto space-y-10 pb-12">

        {
    /* Hero */
  }
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sm text-sky-700 mb-4">
            <Zap className="size-3.5 text-sky-500" />
            4 stacks · 20 days · build something real
          </div>
          <h1 className="tracking-tight text-slate-900">Your Learning Path</h1>
          <p className="text-slate-500 mt-2 max-w-xl">
            Register for each stack individually. Work at your own pace, complete daily tasks, and earn points through quizzes.
          </p>
        </motion.div>

        {
    /* Course grid */
  }
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((m, i) => {
    const Icon = STACK_ICONS[m.slug] ?? BookOpen;
    const label = STACK_LABELS[m.slug] ?? `Module ${m.week}`;
    const isRegistered = registered.includes(m.id);
    const pr = progress.find((p) => p.moduleId === m.id);
    const completedDays = pr?.completedChapters.length ?? 0;
    const pct = m.chapters.length > 0 ? Math.round(completedDays / m.chapters.length * 100) : 0;
    const hasVideo = m.chapters.some((c) => c.videoUrl);
    const dailyQuizCount = m.chapters.reduce((s, c) => s + (c.quiz?.length ?? 0), 0);
    return <motion.div
      key={m.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group"
    >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">

                  {
      /* Colorful header */
    }
                  <div className={`relative bg-gradient-to-br ${m.color} p-7 overflow-hidden`}>
                    <div
      className="absolute inset-0 opacity-[0.10]"
      style={{ backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize: "22px 22px" }}
    />
                    <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/20 rounded-full blur-2xl" />

                    <div className="relative flex items-start justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/15 text-white/90 text-xs mb-3">
                          Module {m.week}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-2xl bg-white/25 backdrop-blur grid place-items-center">
                            <Icon className="size-6 text-white" />
                          </div>
                          <div>
                            <div className="text-xs text-white/60 uppercase tracking-widest">{label}</div>
                            <h2 className="text-white leading-tight">{m.title}</h2>
                          </div>
                        </div>
                      </div>
                      {isRegistered && completedDays === m.chapters.length && <div className="size-9 rounded-full bg-white/25 grid place-items-center shrink-0">
                          <CheckCircle2 className="size-5 text-white" />
                        </div>}
                    </div>

                    {isRegistered && <div className="relative mt-4">
                        <div className="flex justify-between text-xs text-white/70 mb-1.5">
                          <span>{completedDays}/{m.chapters.length} days done</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
                          <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 + 0.3 }}
      className="h-full bg-white/90 rounded-full"
    />
                        </div>
                      </div>}
                  </div>

                  {
      /* Card body */
    }
                  <div className="p-6 space-y-4">
                    <p className="text-slate-600 text-sm leading-relaxed">{m.description}</p>

                    {
      /* Stats */
    }
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        <BookOpen className="size-3" /> {m.chapters.length} days
                      </span>
                      {dailyQuizCount > 0 && <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          <Zap className="size-3" /> {dailyQuizCount} quiz questions
                        </span>}
                      {hasVideo && <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          <Play className="size-3" /> Videos included
                        </span>}
                      {!isRegistered && <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                          <Lock className="size-3" /> Not enrolled
                        </span>}
                    </div>

                    {
      /* Actions */
    }
                    <div className="flex items-center gap-3 pt-1">
                      {isRegistered ? <>
                          <Button asChild className={`flex-1 bg-gradient-to-r ${m.color} hover:opacity-90 gap-2 text-white`}>
                            <Link to={`/modules/${m.slug}`}>
                              {completedDays > 0 ? "Resume" : "Start"} <ArrowRight className="size-4" />
                            </Link>
                          </Button>
                          <Button
      variant="ghost"
      size="sm"
      className="text-slate-400 hover:text-rose-500 text-xs"
      onClick={() => setConfirmUnreg(m.id)}
    >
                            Unenroll
                          </Button>
                        </> : <Button
      className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2"
      onClick={() => registerModule(m.id)}
    >
                          <CheckCircle2 className="size-4" /> Register for this stack
                        </Button>}
                    </div>

                    {
      /* Toggle for course info */
    }
                    {(m.learningOutcomes || m.skills || m.tools) && <button
      onClick={() => setExpandedInfo(expandedInfo === m.id ? null : m.id)}
      className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-700 pt-2 border-t border-slate-100 transition-colors"
    >
                        <span>{expandedInfo === m.id ? "Hide details" : "What you'll learn"}</span>
                        {expandedInfo === m.id ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                      </button>}
                  </div>

                  {
      /* Expandable info panel */
    }
                  <AnimatePresence>
                    {expandedInfo === m.id && <motion.div
      key="info-panel"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden"
    >
                        <div className="px-6 pb-6 space-y-5 border-t border-slate-100">

                          {
      /* What you'll learn */
    }
                          {m.learningOutcomes && m.learningOutcomes.length > 0 && <div className="pt-4">
                              <h3 className="text-slate-800 mb-3 flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                What you'll learn
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {m.learningOutcomes.map((outcome, idx) => <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{outcome}</span>
                                  </div>)}
                              </div>
                            </div>}

                          {
      /* Skills you'll gain */
    }
                          {m.skills && m.skills.length > 0 && <div>
                              <h3 className="text-slate-800 mb-2.5 flex items-center gap-2">
                                <Tag className="size-4 text-sky-500 shrink-0" />
                                Skills you'll gain
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {m.skills.map((skill, idx) => <span
      key={idx}
      className="text-xs px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200"
    >
                                    {skill}
                                  </span>)}
                              </div>
                            </div>}

                          {
      /* Tools you'll learn */
    }
                          {m.tools && m.tools.length > 0 && <div>
                              <h3 className="text-slate-800 mb-2.5 flex items-center gap-2">
                                <Wrench className="size-4 text-violet-500 shrink-0" />
                                Tools you'll learn
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {m.tools.map((tool, idx) => <span
      key={idx}
      className="text-xs px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200"
    >
                                    {tool}
                                  </span>)}
                              </div>
                            </div>}

                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </div>
              </motion.div>;
  })}
        </div>

        {
    /* Journey strip */
  }
        <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.45 }}
    className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col sm:flex-row items-center gap-4"
  >
          <div className="flex -space-x-3">
            {modules.map((m) => {
    const Icon = STACK_ICONS[m.slug] ?? BookOpen;
    return <div key={m.id} className={`size-10 rounded-full bg-gradient-to-br ${m.color} grid place-items-center border-2 border-white shadow-sm`}>
                  <Icon className="size-4 text-white" />
                </div>;
  })}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-slate-800">Complete all 4 stacks to earn your Hackstack certificate</div>
            <div className="text-sm text-slate-500 mt-0.5">
              {registered.length} of {modules.length} stacks enrolled · {modules.reduce((s, m) => s + m.chapters.length, 0)} total days
            </div>
          </div>
          <div className="shrink-0 w-28">
            <div className="text-xs text-slate-500 text-right mb-1">{Math.round(registered.length / modules.length * 100)}%</div>
            <Progress value={Math.round(registered.length / modules.length * 100)} className="h-2 bg-slate-100" />
          </div>
        </motion.div>
      </div>

      {
    /* Unenroll confirm */
  }
      <AnimatePresence>
        {confirmUnreg && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) setConfirmUnreg(null);
    }}
  >
            <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 12 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 12 }}
    className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl"
  >
              <button onClick={() => setConfirmUnreg(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X className="size-4" /></button>
              <h2 className="tracking-tight text-slate-900 mb-1">Unenroll from this stack?</h2>
              <p className="text-sm text-slate-500 mb-6">Your progress will be saved and you can re-enroll any time.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" className="text-slate-500" onClick={() => setConfirmUnreg(null)}>Cancel</Button>
                <Button className="bg-rose-600 hover:bg-rose-500 text-white" onClick={() => {
    unregisterModule(confirmUnreg);
    setConfirmUnreg(null);
  }}>Unenroll</Button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
export {
  ModuleCatalog
};
