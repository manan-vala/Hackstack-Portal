// src/pages/Leaderboard.jsx
// Protected route — only accessible to authenticated users (JWT middleware on backend).
// Reads current user from AuthContext (set up during GitHub OAuth flow).
//
// Wire this into App.jsx:
//   import Leaderboard from "./pages/Leaderboard";
//   <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLeaderboard, useModules } from "./use-leaderboard";
import Podium from "./podium";
import LeaderboardRow from "./leaderboard-row";
import Avatar from "./Avatar";

// ─── Pull the logged-in user from your AuthContext ─────────────────────────────
// Replace this import + hook with however your project exposes the current user.
// After GitHub OAuth, you store user in context; shape: { _id, username, avatarUrl, ... }
// import { useAuth } from "../context/AuthContext";
//
// Temporary stub — remove once AuthContext is wired:
function useAuth() {
  return { user: { _id: "uid_004", username: "a4", avatarUrl: "" } };
}
// ──────────────────────────────────────────────────────────────────────────────

export default function Leaderboard() {
  const { user } = useAuth();
  const [view, setView] = useState("global");

  const { modules, loading: modulesLoading } = useModules();
  const { entries, loading, error } = useLeaderboard(view);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Current user's entry in whichever view is active
  const myEntry = entries.find((e) => e.userId === user?._id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Leaderboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Rankings update in real time as quizzes are submitted.
          </p>
        </div>

        {/* ── Your rank banner (shown if not in top 3 so it's visible) ──── */}
        {myEntry && myEntry.rank > 3 && (
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 mb-6">
            <Avatar
              username={myEntry.username}
              avatarUrl={myEntry.avatarUrl}
              size="sm"
            />
            <div className="flex-1">
              <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                Your rank
              </p>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                #{myEntry.rank} — {myEntry.totalPoints.toLocaleString()} pts
              </p>
            </div>
            <div className="text-xs text-blue-500 dark:text-blue-400 font-medium">
              {myEntry.modulesCompleted} module
              {myEntry.modulesCompleted !== 1 ? "s" : ""} done
            </div>
          </div>
        )}

        {/* ── Toggle: Global / Per-module ───────────────────────────────── */}
        <div className="flex gap-1.5 flex-wrap bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1 mb-6">
          <TabButton
            active={view === "global"}
            onClick={() => setView("global")}
          >
            🌐 Global
          </TabButton>
          {!modulesLoading &&
            modules.map((m) => (
              <TabButton
                key={m._id}
                active={view === m.slug}
                onClick={() => setView(m.slug)}
              >
                {m.title}
              </TabButton>
            ))}
        </div>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-20 text-gray-400 text-sm"
            >
              <span className="animate-pulse">Loading rankings…</span>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 text-red-500 text-sm"
            >
              Failed to load leaderboard. Please try again.
            </motion.div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Podium for top 3 */}
              {top3.length >= 3 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl mb-6 overflow-hidden">
                  <Podium top3={top3} />
                  {/* Separator line */}
                  <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4 mt-4" />
                  {/* Top 3 quick stats */}
                  <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 text-center py-3">
                    {top3.map((e) => (
                      <div key={e.userId} className="px-2">
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {e.username}
                        </p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                          {e.totalPoints.toLocaleString()} pts
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Column headers */}
              <div className="grid grid-cols-[44px_1fr_auto_auto] gap-3 px-4 mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                <span>Rank</span>
                <span>User</span>
                <span className="hidden sm:block text-center">Modules</span>
                <span className="text-right">Points</span>
              </div>

              {/* Top 3 rows */}
              {top3.map((entry, i) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  index={i}
                  isCurrentUser={entry.userId === user?._id}
                />
              ))}

              {/* Divider */}
              {rest.length > 0 && (
                <div className="flex items-center gap-2 my-3 px-1">
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                    Remaining
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                </div>
              )}

              {/* Rows 4+ */}
              {rest.map((entry, i) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  index={i + 3}
                  isCurrentUser={entry.userId === user?._id}
                />
              ))}

              {entries.length === 0 && (
                <div className="text-center py-16 text-gray-400 text-sm">
                  No one has completed this module yet. Be the first!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-[72px] px-3 py-2 rounded-lg text-sm font-medium transition-all
        ${
          active
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
    >
      {children}
    </button>
  );
}
