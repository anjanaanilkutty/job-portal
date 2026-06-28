import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchJobs, setFilters } from '../store/slices/jobSlice';
import { fetchMeta } from '../store/slices/metaSlice';
import JobFilters from '../components/JobFilters';
import JobCard from '../components/JobCard';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const { items, pagination, filters, listStatus, error } = useAppSelector((state) => state.jobs);
  const meta = useAppSelector((state) => state.meta.meta);

  useEffect(() => {
    if (!meta.categories.length) dispatch(fetchMeta());
  }, [dispatch, meta.categories.length]);

  useEffect(() => {
    dispatch(fetchJobs(filters));
  }, [dispatch, filters]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Browse Jobs</h1>
        <p className="mt-1 text-slate-500">
          {pagination.total} {pagination.total === 1 ? 'opening' : 'openings'} available
        </p>
      </div>

      <JobFilters />

      <div className="mt-8">
        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        {listStatus === 'loading' ? (
          <Spinner label="Loading jobs…" />
        ) : items.length === 0 ? (
          <EmptyState
            title="No jobs match your filters"
            description="Try broadening your search or clearing some filters."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <div className="mt-10">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => {
                  dispatch(setFilters({ page }));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
