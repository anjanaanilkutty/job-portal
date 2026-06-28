import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyApplications } from '../store/slices/applicationSlice';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { formatSalary, timeAgo } from '../lib/format';

const statusTone: Record<string, 'green' | 'blue' | 'amber' | 'gray'> = {
  applied: 'blue',
  reviewing: 'amber',
  accepted: 'green',
  rejected: 'gray',
};

export default function ApplicationsPage() {
  const dispatch = useAppDispatch();
  const { myApplications, listStatus, error } = useAppSelector((state) => state.applications);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
        <p className="mt-1 text-slate-500">Track the roles you have applied to</p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {listStatus === 'loading' ? (
        <Spinner label="Loading applications…" />
      ) : myApplications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse open roles and apply to get started."
          action={
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {myApplications.map((application) => {
            const job = application.job;
            return (
              <div
                key={application.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    {job ? (
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-semibold text-slate-900 hover:text-brand-600"
                      >
                        {job.title}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-900">Job removed</span>
                    )}
                    <Badge tone={statusTone[application.status] ?? 'gray'}>
                      {application.status}
                    </Badge>
                  </div>
                  {job && (
                    <p className="mt-1 text-sm text-slate-500">
                      {job.company} · {job.location} · {formatSalary(job.salaryMin, job.salaryMax)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Applied {timeAgo(application.createdAt)}
                  </p>
                </div>
                {job && (
                  <Link to={`/jobs/${job.id}`}>
                    <Button variant="secondary" size="sm">
                      View job
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
