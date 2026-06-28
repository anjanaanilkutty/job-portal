import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchJobs, deleteJob, setFilters, resetFilters } from '../store/slices/jobSlice';
import { fetchMeta } from '../store/slices/metaSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate, formatSalary } from '../lib/format';

function toOptions(values: string[]) {
  return values.map((v) => ({ label: v, value: v }));
}

export default function JobListPage() {
  const dispatch = useAppDispatch();
  const { items, pagination, filters, listStatus, error } = useAppSelector((state) => state.jobs);
  const meta = useAppSelector((state) => state.meta.meta);

  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!meta.categories.length) dispatch(fetchMeta());
  }, [dispatch, meta.categories.length]);

  useEffect(() => {
    dispatch(fetchJobs(filters));
  }, [dispatch, filters]);

  // Debounce free-text search so we don't fire a request on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setFilters({ search: searchInput, page: 1 }));
      }
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleConfirmDelete = async () => {
    if (deleteTarget == null) return;
    setDeleting(true);
    await dispatch(deleteJob(deleteTarget));
    setDeleting(false);
    setDeleteTarget(null);
    dispatch(fetchJobs(filters));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jobs</h1>
          <p className="text-sm text-slate-500">{pagination.total} total postings</p>
        </div>
        <Link to="/jobs/new">
          <Button>+ Post a Job</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="Search title, company…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          placeholder="All categories"
          options={toOptions(meta.categories)}
          value={filters.category}
          onChange={(e) => dispatch(setFilters({ category: e.target.value, page: 1 }))}
        />
        <Select
          placeholder="All experience"
          options={toOptions(meta.experienceLevels)}
          value={filters.experienceLevel}
          onChange={(e) => dispatch(setFilters({ experienceLevel: e.target.value, page: 1 }))}
        />
        <Select
          placeholder="All statuses"
          options={[
            { label: 'Open', value: 'open' },
            { label: 'Closed', value: 'closed' },
          ]}
          value={filters.status ?? ''}
          onChange={(e) =>
            dispatch(
              setFilters({ status: (e.target.value || undefined) as 'open' | 'closed' | undefined, page: 1 })
            )
          }
        />
        <Button
          variant="secondary"
          onClick={() => {
            setSearchInput('');
            dispatch(resetFilters());
          }}
        >
          Reset filters
        </Button>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {listStatus === 'loading' ? (
        <Spinner label="Loading jobs…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your filters or create a new job posting."
          action={
            <Link to="/jobs/new">
              <Button>Post a Job</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="hidden px-4 py-3 md:table-cell">Category</th>
                <th className="hidden px-4 py-3 lg:table-cell">Experience</th>
                <th className="hidden px-4 py-3 lg:table-cell">Salary</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{job.title}</p>
                    <p className="text-xs text-slate-400">
                      {job.company} · {formatDate(job.createdAt)}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{job.category}</td>
                  <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                    {job.experienceLevel}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={job.status === 'open' ? 'green' : 'gray'}>{job.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/jobs/${job.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(job.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page) => dispatch(setFilters({ page }))}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete job"
        message="This will permanently remove the job posting and its applications. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
