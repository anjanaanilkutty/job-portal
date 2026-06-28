import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFeaturedJobs, fetchJobs, setFilters, resetFilters } from '../store/slices/jobSlice';
import { fetchMeta } from '../store/slices/metaSlice';
import JobCard from '../components/JobCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const categoryIcons: Record<string, string> = {
  Engineering: '💻',
  Design: '🎨',
  Product: '📦',
  Marketing: '📣',
  Sales: '🤝',
  Finance: '💰',
  'Human Resources': '👥',
  'Customer Support': '🎧',
};

export default function LandingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { featured, items, listStatus } = useAppSelector((state) => state.jobs);
  const meta = useAppSelector((state) => state.meta.meta);

  useEffect(() => {
    dispatch(fetchMeta());
    dispatch(fetchFeaturedJobs());
    // Reset to a clean slate then load the latest jobs for the home preview.
    dispatch(resetFilters());
    dispatch(fetchJobs({ page: 1, limit: 6, sort: 'newest' }));
  }, [dispatch]);

  const browseCategory = (category: string) => {
    dispatch(setFilters({ category, page: 1 }));
    navigate('/jobs');
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <span className="inline-block rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700">
            {meta.categories.length ? `${meta.categories.length} categories` : 'Now hiring'} · Fresh
            roles weekly
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Find a job that fits <span className="text-brand-600">your future</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
            Browse hundreds of curated openings from companies that value talent. Apply in one click.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/jobs">
              <Button size="lg">Browse all jobs</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Sign in to apply
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* Categories */}
        <section className="py-14">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Explore by category</h2>
            <p className="mt-1 text-slate-500">Find the role that matches your expertise</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {meta.categories.map((category) => (
              <button
                key={category}
                onClick={() => browseCategory(category)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                <span className="text-3xl">{categoryIcons[category] ?? '💼'}</span>
                <span className="text-sm font-semibold text-slate-700">{category}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="py-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Featured jobs</h2>
                <p className="mt-1 text-slate-500">Hand-picked opportunities</p>
              </div>
              <Link to="/jobs" className="text-sm font-medium text-brand-600 hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}

        {/* Latest */}
        <section className="py-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Latest openings</h2>
              <p className="mt-1 text-slate-500">Recently posted roles</p>
            </div>
            <Link to="/jobs" className="text-sm font-medium text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          {listStatus === 'loading' ? (
            <Spinner label="Loading jobs…" />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
