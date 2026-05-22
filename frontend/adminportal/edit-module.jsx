// src/pages/admin/EditModule.jsx
// Placeholder — will be built out to list existing modules and allow editing.
// Route: /admin/modules/edit
// Will contain: module selector dropdown, editable fields, chapter management, quiz editing.

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function EditModule() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/15 mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Edit a Module</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          This page will list all existing modules and allow editing — update chapters, fix markdown,
          swap video links, and manage associated quizzes. Coming in the next sprint.
        </p>

        {/* Placeholder content area */}
        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl px-6 py-10 mb-6">
          <p className="text-gray-600 text-sm">[ Module editor goes here ]</p>
        </div>

        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
