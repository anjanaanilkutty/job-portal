import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setFilters, resetFilters } from '../store/slices/jobSlice';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

function toOptions(values: string[]) {
  return values.map((v) => ({ label: v, value: v }));
}

export default function JobFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.jobs.filters);
  const meta = useAppSelector((state) => state.meta.meta);

  const [search, setSearch] = useState(filters.search ?? '');

  // Keep local input in sync when filters are reset elsewhere.
  useEffect(() => {
    setSearch(filters.search ?? '');
  }, [filters.search]);

  // Debounce search input before dispatching.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (search !== filters.search) {
        dispatch(setFilters({ search, page: 1 }));
      }
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasActiveFilters =
    filters.search || filters.category || filters.experienceLevel || filters.jobType;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Search by title, company, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          placeholder="All categories"
          options={toOptions(meta.categories)}
          value={filters.category}
          onChange={(e) => dispatch(setFilters({ category: e.target.value, page: 1 }))}
        />
        <Select
          placeholder="All experience levels"
          options={toOptions(meta.experienceLevels)}
          value={filters.experienceLevel}
          onChange={(e) => dispatch(setFilters({ experienceLevel: e.target.value, page: 1 }))}
        />
        <Select
          placeholder="All job types"
          options={toOptions(meta.jobTypes)}
          value={filters.jobType}
          onChange={(e) => dispatch(setFilters({ jobType: e.target.value, page: 1 }))}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Select
          options={[
            { label: 'Newest first', value: 'newest' },
            { label: 'Oldest first', value: 'oldest' },
          ]}
          value={filters.sort ?? 'newest'}
          onChange={(e) =>
            dispatch(setFilters({ sort: e.target.value as 'newest' | 'oldest', page: 1 }))
          }
          className="w-44"
        />
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              dispatch(resetFilters());
            }}
          >
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  );
}
