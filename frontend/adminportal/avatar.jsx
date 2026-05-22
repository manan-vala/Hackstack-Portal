// src/components/leaderboard/Avatar.jsx
// Shows avatarUrl from GitHub OAuth if available, else colored initials fallback.

const PALETTE = [
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-teal-100",   text: "text-teal-700"   },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-pink-100",   text: "text-pink-700"   },
  { bg: "bg-blue-100",   text: "text-blue-700"   },
  { bg: "bg-green-100",  text: "text-green-700"  },
  { bg: "bg-amber-100",  text: "text-amber-700"  },
];

export default function Avatar({ username = "", avatarUrl = "", size = "md", rank = 99 }) {
  const sizeClass = size === "lg" ? "w-14 h-14 text-lg" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  const ringClass =
    rank === 1 ? "ring-2 ring-yellow-400" :
    rank === 2 ? "ring-2 ring-gray-400"   :
    rank === 3 ? "ring-2 ring-orange-400" : "";

  const color = PALETTE[username.charCodeAt(0) % PALETTE.length];
  const initials = username.slice(0, 2).toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={`${sizeClass} ${ringClass} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${ringClass} ${color.bg} ${color.text}
        rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
