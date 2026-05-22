import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './applayout.css';

export function AppLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="app-layout">
      <nav className="app-nav">
        <div className="app-nav-brand">Hackstack</div>
        <div className="app-nav-links">
          <Link
            to="/dashboard"
            className={location.pathname.startsWith('/dashboard') ? 'is-active' : ''}
          >
            Dashboard
          </Link>
          <Link
            to="/modules"
            className={location.pathname.startsWith('/modules') ? 'is-active' : ''}
          >
            Modules
          </Link>
        </div>
        {user ? <div className="app-nav-user">@{user.username}</div> : null}
      </nav>
      <main className="app-main">{children}</main>
    </div>
  );
}
