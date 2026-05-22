import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAdminAuth } from "./admin-auth-context";
import Avatar from "./avatar";
import LeaderboardRow from "./leaderboard-row";
import Podium from "./podium";
import { useLeaderboard, useModules } from "./use-leaderboard";

export default function Leaderboard() {
  const { admin } = useAdminAuth();
  const [view, setView] = useState("global");

  const { modules, loading: modulesLoading } = useModules();
  const { entries, loading, error } = useLeaderboard(view);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const myEntry = entries.find((entry) => entry.userId === admin?._id);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Leaderboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Rankings update as quizzes are submitted across the platform.
          </p>
        </div>

        {myEntry && myEntry.rank > 3 ? (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
            <Avatar
              username={myEntry.username}
              avatarUrl={myEntry.avatarUrl}
              size="sm"
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-500 dark:text-blue-400">
                Your rank
              </p>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                #{myEntry.rank} - {(myEntry.totalPoints || 0).toLocaleString()} pts
              </p>
            </div>
            <div className="text-xs font-medium text-blue-500 dark:text-blue-400">
              {(myEntry.modulesCompleted || 0).toLocaleString()} modules
            </div>
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-1.5 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
          <TabButton active={view === "global"} onClick={() => setView("global")}>
            Global
          </TabButton>
          {!modulesLoading
            ? modules.map((module) => (
                <TabButton
                  key={module._id}
                  active={view === module.slug}
                  onClick={() => setView(module.slug)}
                >
                  {module.title}
                </TabButton>
              ))
            : null}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20 text-sm text-gray-400"
            >
              <span className="animate-pulse">Loading rankings...</span>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center text-sm text-red-500"
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
              {top3.length >= 3 ? (
                <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                  <Podium top3={top3} />
                  <div className="mx-4 mt-4 h-px bg-gray-100 dark:bg-gray-800" />
                  <div className="grid grid-cols-3 divide-x divide-gray-100 py-3 text-center dark:divide-gray-800">
                    {top3.map((entry) => (
                      <div key={entry.userId} className="px-2">
                        <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                          {entry.username}
                        </p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                          {(entry.totalPoints || 0).toLocaleString()} pts
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mb-2 grid grid-cols-[44px_1fr_auto_auto] gap-3 px-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                <span>Rank</span>
                <span>User</span>
                <span className="hidden text-center sm:block">Modules</span>
                <span className="text-right">Points</span>
              </div>

              {top3.map((entry, index) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  index={index}
                  isCurrentUser={entry.userId === admin?._id}
                />
              ))}

              {rest.length > 0 ? (
                <div className="my-3 flex items-center gap-2 px-1">
                  <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    Remaining
                  </span>
                  <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                </div>
              ) : null}

              {rest.map((entry, index) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  index={index + 3}
                  isCurrentUser={entry.userId === admin?._id}
                />
              ))}

              {entries.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">
                  No leaderboard entries yet. Submit the first quiz result to
                  kick this off.
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[72px] flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
