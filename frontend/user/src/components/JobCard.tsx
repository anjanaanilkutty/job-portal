import { Link } from 'react-router-dom';
import { Job } from '../types';
import { formatSalary, timeAgo, initials } from '../lib/format';
import Badge from './ui/Badge';

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
            {initials(job.company)}
          </span>
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-brand-600">{job.title}</h3>
            <p className="text-sm text-slate-500">{job.company}</p>
          </div>
        </div>
        {job.isFeatured && <Badge tone="amber">Featured</Badge>}
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-slate-500">{job.description}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone="green">{job.category}</Badge>
        <Badge tone="blue">{job.experienceLevel}</Badge>
        <Badge tone="gray">{job.jobType}</Badge>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
        <span className="font-medium text-slate-700">{formatSalary(job.salaryMin, job.salaryMax)}</span>
        <span className="text-slate-400">📍 {job.location}</span>
      </div>
      <p className="mt-2 text-xs text-slate-400">{timeAgo(job.createdAt)}</p>
    </Link>
  );
}
