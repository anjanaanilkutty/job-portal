import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDashboardStats } from '../store/slices/metaSlice';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import { formatDate } from '../lib/format';

interface StatCardProps {
  label: string;
  value: number;
  tone: string;
}

function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { stats, statsStatus, error } = useAppSelector((state) => state.meta);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (statsStatus === 'loading' && !stats) return <Spinner label="Loading dashboard…" />;
  if (statsStatus === 'failed') return <Alert tone="error">{error}</Alert>;
  if (!stats) return null;

  const { totals, byCategory, recentJobs } = stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of jobs and applications</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Jobs" value={totals.totalJobs} tone="text-slate-800" />
        <StatCard label="Open Jobs" value={totals.openJobs} tone="text-brand-600" />
        <StatCard label="Applications" value={totals.totalApplications} tone="text-blue-600" />
        <StatCard label="Candidates" value={totals.totalUsers} tone="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Recently posted</h2>
            <Link to="/jobs" className="text-sm font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between py-3">
                <div>
                  <Link
                    to={`/jobs/${job.id}/edit`}
                    className="font-medium text-slate-800 hover:text-brand-600"
                  >
                    {job.title}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {job.company} · {formatDate(job.createdAt)}
                  </p>
                </div>
                <Badge tone={job.status === 'open' ? 'green' : 'gray'}>{job.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Jobs by category</h2>
          <div className="space-y-3">
            {byCategory.map((row) => {
              const count = Number(row.count);
              const pct = totals.totalJobs ? Math.round((count / totals.totalJobs) * 100) : 0;
              return (
                <div key={row.category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-600">{row.category}</span>
                    <span className="text-slate-400">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
