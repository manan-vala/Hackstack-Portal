import { NavLink, Outlet } from "react-router";
import { motion } from "motion/react";
import { BookOpen, Code2 } from "lucide-react";
function Layout() {
  return <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-60 flex-col border-r border-white/10 bg-black/30 backdrop-blur-xl p-5">
          <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-2 mb-8"
  >
            <NavLink to="/modules" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center">
                <Code2 className="size-5" />
              </div>
              <div>
                <div className="font-semibold tracking-tight">Hackstack</div>
                <div className="text-xs text-slate-400">Portal</div>
              </div>
            </NavLink>
          </motion.div>

          <nav className="flex flex-col gap-1">
            <NavLink
    to="/modules"
    className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
  >
              <BookOpen className="size-4" />
              Modules
            </NavLink>
          </nav>
        </aside>

        {
    /* Mobile top bar */
  }
        <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 border-b border-white/10 bg-black/60 backdrop-blur-xl flex items-center px-4 gap-3">
          <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center shrink-0">
            <Code2 className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Hackstack</span>
        </div>

        <main className="flex-1 min-w-0 p-6 md:p-10 overflow-x-hidden md:mt-0 mt-14">
          <Outlet />
        </main>
      </div>
    </div>;
}
export {
  Layout
};
