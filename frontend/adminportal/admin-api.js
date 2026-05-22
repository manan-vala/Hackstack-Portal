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
