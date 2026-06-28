import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { api } from '../../lib/axios';
import Button from '../ui/Button';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/jobs', label: 'Jobs', end: false },
  { to: '/jobs/new', label: 'Post a Job', end: false },
];

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout; we clear local state regardless
    }
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
            J
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Job Portal</p>
            <p className="text-xs text-slate-400">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-700">{user?.name}</p>
          <p className="mb-3 text-xs text-slate-400">{user?.email}</p>
          <Button variant="secondary" size="sm" className="w-full" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:hidden">
          <span className="font-semibold text-slate-800">Job Portal Admin</span>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
