// src/api/leaderboard.js
// Connects to your Express backend endpoints.
// JWT token is read from localStorage (stored there after GitHub OAuth).

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("jwt");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * GET /api/leaderboard/global
 * Returns array sorted by totalPoints desc.
 * Shape: [{ userId, username, avatarUrl, modulesCompleted, totalPoints, rank }]
 */
export async function fetchGlobalLeaderboard() {
  const res = await fetch(`${BASE_URL}/leaderboard/global`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch global leaderboard");
  return res.json();
}

/**
 * GET /api/leaderboard/module/:slug
 * Returns module-specific leaderboard.
 * Shape: same as global
 */
export async function fetchModuleLeaderboard(slug) {
  const res = await fetch(`${BASE_URL}/leaderboard/module/${slug}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch leaderboard for module: ${slug}`);
  return res.json();
}

/**
 * GET /api/modules
 * Fetches all available modules to populate the toggle tabs dynamically.
 * Shape: [{ _id, title, slug }]
 */
export async function fetchModules() {
  const res = await fetch(`${BASE_URL}/modules`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch modules");
  return res.json();
}
