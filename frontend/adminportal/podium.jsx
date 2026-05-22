// src/components/leaderboard/Podium.jsx
// Displays top 3 in a visual podium layout. Order: 2nd | 1st | 3rd

import { motion } from "framer-motion";
import Avatar from "./avatar";

const MEDALS = ["🥇", "🥈", "🥉"];
const HEIGHTS = ["h-20", "h-28", "h-14"]; // 2nd | 1st | 3rd
const PODIUM_ORDER = [1, 0, 2]; // indices into top3 array

export default function Podium({ top3 = [] }) {
  if (top3.length < 3) return null;

  return (
    <div className="flex items-end justify-center gap-3 pt-8 pb-0 px-4">
      {PODIUM_ORDER.map((dataIdx, colIdx) => {
        const entry = top3[dataIdx];
        const rank = dataIdx + 1;
        const isFirst = rank === 1;

        return (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIdx * 0.1, type: "spring", stiffness: 180 }}
            className="flex flex-col items-center gap-2"
          >
            {/* Avatar + name */}
            <Avatar
              username={entry.username}
              avatarUrl={entry.avatarUrl}
              size={isFirst ? "lg" : "md"}
              rank={rank}
            />
            <span
              className={`font-semibold text-gray-800 dark:text-gray-100 ${isFirst ? "text-sm" : "text-xs"} text-center max-w-[80px] truncate`}
            >
              {entry.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {entry.totalPoints.toLocaleString()} pts
            </span>

            {/* Podium block */}
            <div
              className={`w-24 ${HEIGHTS[colIdx]} rounded-t-lg flex flex-col items-center justify-center gap-1
                ${
                  rank === 1
                    ? "bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700"
                    : rank === 2
                      ? "bg-gray-100  dark:bg-gray-800  border border-gray-300  dark:border-gray-600"
                      : "bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800"
                }`}
            >
              <span className="text-xl">{MEDALS[dataIdx]}</span>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                {rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
