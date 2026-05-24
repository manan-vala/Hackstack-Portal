import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  AtSign,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  X,
  Sparkles,
  Hash,
  BookOpen
} from "lucide-react";

export function ProfileModal({ isOpen, onClose, user }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/72 backdrop-blur-md p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden border border-slate-200/10 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-3xl p-6 md:p-8"
          >
            {/* Background Accent Gradients */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 -z-10" />

            {/* Header / Close button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-cyan-500 size-5" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-wide uppercase">
                  Student Profile
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-3">
                <img
                  src={user?.avatarUrl || "https://api.dicebear.com/7.x/pixel-art/svg"}
                  alt={user?.name || "Student Avatar"}
                  className="w-24 h-24 rounded-full border-4 border-cyan-500/20 object-cover shadow-md"
                />
                <span className="absolute bottom-0 right-0 bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  Active
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {user?.name || "Student"}
              </h3>
              <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">
                @{user?.username || "student"}
              </p>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <Mail className="text-slate-400 dark:text-slate-500 size-5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </span>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {user?.email || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <Phone className="text-slate-400 dark:text-slate-500 size-5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mobile Number
                  </span>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {user?.countryCode && user?.mobileNumber ? `${user.countryCode} ${user.mobileNumber}` : user?.mobileNumber || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <GraduationCap className="text-slate-400 dark:text-slate-500 size-5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    College / Institute
                  </span>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {user?.college || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <Calendar className="text-slate-400 dark:text-slate-500 size-5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Year of Study
                  </span>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {user?.year || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <Hash className="text-slate-400 dark:text-slate-500 size-5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Roll Number
                  </span>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {user?.rollNumber || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <BookOpen className="text-slate-400 dark:text-slate-500 size-5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Programme
                  </span>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {user?.programme === "Btech" ? "B.Tech" :
                     user?.programme === "Mtech" ? "M.Tech" :
                     user?.programme || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action / Close button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-sm transition-colors shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
