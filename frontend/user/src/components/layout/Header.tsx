import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { resetApplications } from '../../store/slices/applicationSlice';
import { api } from '../../lib/axios';
import { initials } from '../../lib/format';

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors during logout
    }
    dispatch(logout());
    dispatch(resetApplications());
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
            J
          </span>
          <span className="text-lg font-bold text-slate-900">JobFinder</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/jobs" className={navLinkClass}>
            Browse Jobs
          </NavLink>
          {user && (
            <NavLink to="/applications" className={navLinkClass}>
              My Applications
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 sm:flex">
                {initials(user.name)}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
