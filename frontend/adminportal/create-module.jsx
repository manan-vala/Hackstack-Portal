// src/pages/admin/CreateModule.jsx
// Placeholder — backend team / next sprint will build out the full form here.
// Route: /admin/modules/create
// Will contain: module title, slug, description, chapters (markdown + video URL), quiz builder.

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CreateModule() {
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/15 mb-6">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Create a Module</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          This page will contain the full module creation form — title, slug, chapters with markdown content,
          YouTube video links, and quiz builder. Coming in the next sprint.
        </p>

        {/* Placeholder content area */}
        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl px-6 py-10 mb-6">
          <p className="text-gray-600 text-sm">[ Module creation form goes here ]</p>
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
