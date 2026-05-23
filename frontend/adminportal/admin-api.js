// src/api/admin.js
// Hits your Express backend for admin authentication.
// Backend should verify credentials + check isAdmin: true in Users collection,
// then return a signed JWT.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * POST /api/auth/admin/login
 * Body: { username, password }
 * Returns: { token, user: { _id, username, avatarUrl, isAdmin } }
 *
 * Backend middleware should:
 *  1. Verify username + password
 *  2. Check user.isAdmin === true in MongoDB
 *  3. Sign and return JWT
 */
export async function adminLogin({ username, password }) {
  const res = await fetch(`${BASE_URL}/auth/admin/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  if (!data.user?.isAdmin) {
    throw new Error("Access denied. You are not an admin.");
  }

  return data; // { token, user }
}

function getAdminHeaders() {
  const token = localStorage.getItem("jwt");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJsonResponse(res, fallbackMessage) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function createAdminModule(moduleData) {
  const res = await fetch(`${BASE_URL}/admin/modules`, {
    method: "POST",
    credentials: "include",
    headers: getAdminHeaders(),
    body: JSON.stringify(moduleData),
  });

  return parseJsonResponse(res, "Failed to create module");
}

export async function createAdminQuiz(quizData) {
  const res = await fetch(`${BASE_URL}/admin/quizzes`, {
    method: "POST",
    credentials: "include",
    headers: getAdminHeaders(),
    body: JSON.stringify(quizData),
  });

  return parseJsonResponse(res, "Failed to create quiz");
}

export async function listAdminModules() {
  const res = await fetch(`${BASE_URL}/admin/modules`, {
    credentials: "include",
    headers: getAdminHeaders(),
  });

  return parseJsonResponse(res, "Failed to load modules");
}

export async function getAdminModule(moduleId) {
  const res = await fetch(`${BASE_URL}/admin/modules/${moduleId}`, {
    credentials: "include",
    headers: getAdminHeaders(),
  });

  return parseJsonResponse(res, "Failed to load module");
}

export async function updateAdminModule(moduleId, moduleData) {
  const res = await fetch(`${BASE_URL}/admin/modules/${moduleId}`, {
    method: "PUT",
    credentials: "include",
    headers: getAdminHeaders(),
    body: JSON.stringify(moduleData),
  });

  return parseJsonResponse(res, "Failed to update module");
}

export async function deleteAdminModule(moduleId) {
  const res = await fetch(`${BASE_URL}/admin/modules/${moduleId}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAdminHeaders(),
  });

  return parseJsonResponse(res, "Failed to delete module");
}

export async function listAdminQuizzes() {
  const res = await fetch(`${BASE_URL}/admin/quizzes`, {
    credentials: "include",
    headers: getAdminHeaders(),
  });

  return parseJsonResponse(res, "Failed to load quizzes");
}

export async function updateAdminQuiz(quizId, quizData) {
  const res = await fetch(`${BASE_URL}/admin/quizzes/${quizId}`, {
    method: "PATCH",
    credentials: "include",
    headers: getAdminHeaders(),
    body: JSON.stringify(quizData),
  });

  return parseJsonResponse(res, "Failed to update quiz");
}

export async function deleteAdminQuiz(quizId) {
  const res = await fetch(`${BASE_URL}/admin/quizzes/${quizId}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAdminHeaders(),
  });

  return parseJsonResponse(res, "Failed to delete quiz");
}

// ─── Mock login (remove once backend is live) ──────────────────────────────
// Set VITE_USE_MOCK=true in .env.development to use this.
export async function mockAdminLogin({ username, password }) {
  await new Promise((r) => setTimeout(r, 800)); // simulate network

  if (username === "admin" && password === "hackstack123") {
    return {
      token: "mock_jwt_token",
      user: { _id: "admin_001", username: "admin", avatarUrl: "", isAdmin: true },
    };
  }
  throw new Error("Invalid credentials");
}
