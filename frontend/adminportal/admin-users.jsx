// src/pages/admin/AdminUsers.jsx
// View and monitor user info and module progress.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminUsersProgress, mockGetAdminUsersProgress } from "./admin-api";
import Avatar from "./avatar";

const USE_MOCK = false;

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const fetcher = USE_MOCK ? mockGetAdminUsersProgress : getAdminUsersProgress;
        const data = await fetcher();
        if (active) {
          setUsers(data);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
        if (active) {
          setError(err.message || "Failed to load user progress data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    const interval = setInterval(loadUsers, 60000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      (user.email && user.email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/30"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="text-right">
            <h1 className="text-white font-bold text-lg leading-tight">Admin Portal</h1>
            <p className="text-gray-400 text-xs">User Progress & Analytics</p>
          </div>
        </div>

        {/* ── Header Section ─────────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Users & Progress
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Monitor registered student profiles, registered courses, lesson completions, and quiz performance.
          </p>
        </div>

        {/* ── Search & Actions Bar ────────────────────────────────────── */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl pl-11 pr-4 py-3
                placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* ── Main Content ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-24 text-sm text-gray-400"
            >
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Loading user records...</span>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-900/20 border border-red-800/60 rounded-2xl p-6 text-center text-red-400"
            >
              <p className="font-semibold mb-1">Failed to fetch data</p>
              <p className="text-sm text-red-500">{error}</p>
            </motion.div>
          ) : filteredUsers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-400"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-500 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="font-medium text-gray-400">No users found</p>
              <p className="text-sm text-gray-400 mt-1">Try resetting your search query.</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-gray-900 border border-gray-800 hover:border-indigo-500/20 rounded-2xl p-5 shadow-lg transition-all"
                >
                  {/* User Profile Summary Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        username={user.username}
                        avatarUrl={user.avatarUrl}
                        size="md"
                      />
                      <div>
                        <h3 className="text-white font-bold text-base leading-tight">
                          {user.username}
                        </h3>
                        <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-start sm:self-center">
                      <div className="text-center sm:text-right">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                          Total Quiz Score
                        </span>
                        <span className="text-2xl font-black text-indigo-400">
                          {user.totalScore || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Registered Modules & Chapter Completion Progress */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      Module Details ({user.modulesProgress?.length || 0})
                    </h4>

                    {(!user.modulesProgress || user.modulesProgress.length === 0) ? (
                      <p className="text-xs text-gray-400 italic">No registered modules yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {user.modulesProgress.map((mod) => (
                          <div
                            key={mod.moduleId}
                            className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {mod.title}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                slug: {mod.slug}
                              </p>
                            </div>

                            <div className="flex items-center gap-5 justify-between sm:justify-start">
                              <div className="text-left sm:text-center">
                                <span className="text-[10px] text-gray-400 uppercase block tracking-wider">
                                  Days Completed
                                </span>
                                <span className="text-sm font-bold text-amber-400">
                                  {mod.daysCompleted}/{mod.totalDays || 0}
                                </span>
                              </div>
                              
                              <div className="h-7 w-px bg-gray-800 hidden sm:block" />

                              <div className="text-right sm:text-center">
                                <span className="text-[10px] text-gray-400 uppercase block tracking-wider">
                                  Quiz Score
                                </span>
                                <span className="text-sm font-bold text-emerald-400">
                                  {mod.moduleScore}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
