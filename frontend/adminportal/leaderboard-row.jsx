// src/components/leaderboard/LeaderboardRow.jsx
// Renders one row. Highlighted if it's the current user's row.
// Columns match spec: Rank | User (Avatar + Name) | Modules Completed | Total Points

import { motion } from "framer-motion";
import Avatar from "./avatar";

const RANK_BADGE = {
  1: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  2: "bg-gray-100   text-gray-600   dark:bg-gray-700      dark:text-gray-300",
  3: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

export default function LeaderboardRow({ entry, index, isCurrentUser }) {
  const badgeClass =
    RANK_BADGE[entry.rank] ??
    "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
  const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.035, type: "spring", stiffness: 220 }}
      className={`grid grid-cols-[44px_1fr_auto_auto] items-center gap-3 px-4 py-3 rounded-xl mb-1.5 transition-colors
        ${
          isCurrentUser
            ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
            : entry.rank <= 3
              ? "bg-gray-50 border border-gray-200 dark:bg-gray-800/60 dark:border-gray-700"
              : "bg-white border border-gray-100 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800"
        }`}
    >
      {/* Rank badge */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${badgeClass}`}
      >
        {MEDALS[entry.rank] ?? `#${entry.rank}`}
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar
          username={entry.username}
          avatarUrl={entry.avatarUrl}
          size="sm"
          rank={entry.rank}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {entry.username}
            </span>
            {isCurrentUser && (
              <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                you
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modules completed */}
      <div className="text-center hidden sm:block">
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {entry.modulesCompleted}
        </div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500">
          modules
        </div>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {entry.totalPoints.toLocaleString()}
        </div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500">pts</div>
      </div>
    </motion.div>
  );
}
