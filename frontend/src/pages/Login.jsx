import React from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

const ERROR_MESSAGES = {
  auth_failed:
    'Sign-in could not be completed. In GitHub → OAuth app settings, set the callback URL to http://localhost:5173/api/auth/github/callback, then restart both servers.',
  auth_denied: 'GitHub sign-in was cancelled.',
  invalid_state: 'Session expired. Please try again.',
  missing_code: 'GitHub did not return an authorization code.',
};

const Login = () => {
  const [searchParams] = useSearchParams();
  const errorKey = searchParams.get('error');
  const errorMessage = ERROR_MESSAGES[errorKey];

  const handleLogin = () => {
    window.location.href = authService.getGitHubRedirectUrl();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen overflow-hidden bg-[#0a0a0f] text-zinc-100"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ x: [0, -24, 0], y: [0, 16, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12"
      >
        <header className="mb-10 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-violet-400/90">
            Student Web Committee
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Hackstack Portal
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Modules, trace checkpoints, and leaderboard — one GitHub sign-in.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
              role="alert"
            >
              {errorMessage}
            </motion.div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 active:scale-[0.99]"
          >
            <svg className="h-5 w-5 transition group-hover:scale-105" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          <p className="mt-6 text-center text-xs text-zinc-500">
            We only use your public GitHub profile to identify your account.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
