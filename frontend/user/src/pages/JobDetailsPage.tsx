import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchJobById, clearCurrent } from '../store/slices/jobSlice';
import {
  applyToJob,
  checkApplicationStatus,
  clearApplicationError,
} from '../store/slices/applicationSlice';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatSalary, timeAgo, initials } from '../lib/format';

export default function JobDetailsPage() {
  const { id } = useParams();
  const jobId = Number(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { current, detailStatus, error } = useAppSelector((state) => state.jobs);
  const { user } = useAppSelector((state) => state.auth);
  const { appliedJobIds, submitStatus, error: applyError } = useAppSelector(
    (state) => state.applications
  );

  const [coverLetter, setCoverLetter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  const hasApplied = appliedJobIds.includes(jobId);

  useEffect(() => {
    dispatch(fetchJobById(jobId));
    if (user) dispatch(checkApplicationStatus(jobId));
    return () => {
      dispatch(clearCurrent());
      dispatch(clearApplicationError());
    };
  }, [dispatch, jobId, user]);

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    const action = await dispatch(applyToJob({ jobId, coverLetter: coverLetter.trim() || undefined }));
    if (!('error' in action)) {
      setSuccess(true);
      setShowForm(false);
    }
  };

  if (detailStatus === 'loading') return <Spinner label="Loading job…" />;
  if (detailStatus === 'failed')
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Alert tone="error">{error ?? 'Job not found'}</Alert>
        <Link to="/jobs" className="mt-4 inline-block text-sm font-medium text-brand-600">
          ← Back to jobs
        </Link>
      </div>
    );
  if (!current) return null;

  const closed = current.status === 'closed';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/jobs" className="mb-6 inline-block text-sm font-medium text-brand-600 hover:underline">
        ← Back to jobs
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-600">
                {initials(current.company)}
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{current.title}</h1>
                  {current.isFeatured && <Badge tone="amber">Featured</Badge>}
                  {closed && <Badge tone="gray">Closed</Badge>}
                </div>
                <p className="mt-1 text-slate-500">
                  {current.company} · 📍 {current.location}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="green">{current.category}</Badge>
              <Badge tone="blue">{current.experienceLevel}</Badge>
              <Badge tone="gray">{current.jobType}</Badge>
            </div>

            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Job description</h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-600">
                {current.description}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar / apply */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Salary range</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatSalary(current.salaryMin, current.salaryMax)}
            </p>
            <hr className="my-4 border-slate-100" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Job type</dt>
                <dd className="font-medium text-slate-700">{current.jobType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Experience</dt>
                <dd className="font-medium text-slate-700">{current.experienceLevel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Posted</dt>
                <dd className="font-medium text-slate-700">{timeAgo(current.createdAt)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              {success || hasApplied ? (
                <Alert tone="success">✓ You have applied to this job.</Alert>
              ) : closed ? (
                <Alert tone="info">This job is no longer accepting applications.</Alert>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">Sign in to apply for this role.</p>
                  <Button
                    className="w-full"
                    onClick={() => navigate('/login', { state: { from: { pathname: `/jobs/${jobId}` } } })}
                  >
                    Sign in to apply
                  </Button>
                </div>
              ) : !showForm ? (
                <Button className="w-full" onClick={() => setShowForm(true)}>
                  Apply now
                </Button>
              ) : (
                <form onSubmit={handleApply} className="space-y-3">
                  {applyError && <Alert tone="error">{applyError}</Alert>}
                  <textarea
                    rows={5}
                    placeholder="Add a short cover letter (optional)…"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" isLoading={submitStatus === 'loading'}>
                      Submit application
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
