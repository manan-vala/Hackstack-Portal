// src/hooks/useLeaderboard.js
// Handles fetch, loading, and error state for any leaderboard view.

import { useState, useEffect } from "react";
import { fetchGlobalLeaderboard, fetchModuleLeaderboard, fetchModules } from "../api/leaderboard";

// ─── Mock fallback data (remove once backend is live) ─────────────────────────
const MOCK_GLOBAL = [
  { rank: 1,  userId: "uid_001", username: "a1",  avatarUrl: "", modulesCompleted: 7, totalPoints: 4820 },
  { rank: 2,  userId: "uid_002", username: "a2",  avatarUrl: "", modulesCompleted: 6, totalPoints: 4310 },
  { rank: 3,  userId: "uid_003", username: "a3",  avatarUrl: "", modulesCompleted: 6, totalPoints: 3975 },
  { rank: 4,  userId: "uid_004", username: "a4",  avatarUrl: "", modulesCompleted: 5, totalPoints: 3640 },
  { rank: 5,  userId: "uid_005", username: "a5",  avatarUrl: "", modulesCompleted: 5, totalPoints: 3480 },
  { rank: 6,  userId: "uid_006", username: "a6",  avatarUrl: "", modulesCompleted: 4, totalPoints: 2990 },
  { rank: 7,  userId: "uid_007", username: "a7",  avatarUrl: "", modulesCompleted: 4, totalPoints: 2750 },
  { rank: 8,  userId: "uid_008", username: "a8",  avatarUrl: "", modulesCompleted: 3, totalPoints: 2100 },
  { rank: 9,  userId: "uid_009", username: "a9",  avatarUrl: "", modulesCompleted: 3, totalPoints: 1885 },
  { rank: 10, userId: "uid_010", username: "a10", avatarUrl: "", modulesCompleted: 2, totalPoints: 1200 },
];

const MOCK_MODULES = [
  { _id: "m1", title: "React",   slug: "react"  },
  { _id: "m2", title: "Node.js", slug: "node"   },
  { _id: "m3", title: "Django",  slug: "django" },
];

const MOCK_MODULE_DATA = {
  react: [
    { rank: 1, userId: "uid_002", username: "a2",  avatarUrl: "", modulesCompleted: 3, totalPoints: 980 },
    { rank: 2, userId: "uid_001", username: "a1",  avatarUrl: "", modulesCompleted: 3, totalPoints: 870 },
    { rank: 3, userId: "uid_006", username: "a6",  avatarUrl: "", modulesCompleted: 2, totalPoints: 760 },
    { rank: 4, userId: "uid_004", username: "a4",  avatarUrl: "", modulesCompleted: 2, totalPoints: 650 },
    { rank: 5, userId: "uid_009", username: "a9",  avatarUrl: "", modulesCompleted: 1, totalPoints: 420 },
  ],
  node: [
    { rank: 1, userId: "uid_003", username: "a3",  avatarUrl: "", modulesCompleted: 3, totalPoints: 910 },
    { rank: 2, userId: "uid_005", username: "a5",  avatarUrl: "", modulesCompleted: 2, totalPoints: 800 },
    { rank: 3, userId: "uid_001", username: "a1",  avatarUrl: "", modulesCompleted: 2, totalPoints: 775 },
    { rank: 4, userId: "uid_007", username: "a7",  avatarUrl: "", modulesCompleted: 1, totalPoints: 500 },
    { rank: 5, userId: "uid_008", username: "a8",  avatarUrl: "", modulesCompleted: 1, totalPoints: 390 },
  ],
  django: [
    { rank: 1, userId: "uid_001", username: "a1",  avatarUrl: "", modulesCompleted: 3, totalPoints: 1050 },
    { rank: 2, userId: "uid_004", username: "a4",  avatarUrl: "", modulesCompleted: 2, totalPoints: 870  },
    { rank: 3, userId: "uid_002", username: "a2",  avatarUrl: "", modulesCompleted: 2, totalPoints: 740  },
    { rank: 4, userId: "uid_010", username: "a10", avatarUrl: "", modulesCompleted: 1, totalPoints: 600  },
    { rank: 5, userId: "uid_006", username: "a6",  avatarUrl: "", modulesCompleted: 1, totalPoints: 430  },
  ],
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true"; // set in .env.development

// ─────────────────────────────────────────────────────────────────────────────

export function useModules() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (USE_MOCK) {
      setModules(MOCK_MODULES);
      setLoading(false);
      return;
    }
    fetchModules()
      .then(setModules)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { modules, loading, error };
}

export function useLeaderboard(view) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (USE_MOCK) {
      setTimeout(() => {
        setEntries(view === "global" ? MOCK_GLOBAL : (MOCK_MODULE_DATA[view] ?? []));
        setLoading(false);
      }, 300); // simulates network
      return;
    }

    const fetcher =
      view === "global"
        ? fetchGlobalLeaderboard()
        : fetchModuleLeaderboard(view);

    fetcher
      .then(setEntries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [view]);

  return { entries, loading, error };
}
