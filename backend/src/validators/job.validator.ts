import { z } from 'zod';
import {
  JOB_CATEGORIES,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  JOB_STATUSES,
} from '../models/job.model';

const baseJob = {
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  company: z.string().min(2, 'Company is required').max(120),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(JOB_CATEGORIES),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  jobType: z.enum(JOB_TYPES),
  location: z.string().min(2, 'Location is required').max(120),
  salaryMin: z.coerce.number().int().nonnegative().optional().nullable(),
  salaryMax: z.coerce.number().int().nonnegative().optional().nullable(),
  isFeatured: z.coerce.boolean().optional(),
  status: z.enum(JOB_STATUSES).optional(),
};

export const createJobSchema = z
  .object(baseJob)
  .refine(
    (data) =>
      data.salaryMin == null || data.salaryMax == null || data.salaryMax >= data.salaryMin,
    { message: 'Maximum salary must be greater than or equal to minimum salary', path: ['salaryMax'] }
  );

export const updateJobSchema = z
  .object({
    title: baseJob.title.optional(),
    company: baseJob.company.optional(),
    description: baseJob.description.optional(),
    category: baseJob.category.optional(),
    experienceLevel: baseJob.experienceLevel.optional(),
    jobType: baseJob.jobType.optional(),
    location: baseJob.location.optional(),
    salaryMin: baseJob.salaryMin,
    salaryMax: baseJob.salaryMax,
    isFeatured: baseJob.isFeatured,
    status: baseJob.status,
  })
  .refine(
    (data) =>
      data.salaryMin == null || data.salaryMax == null || data.salaryMax >= data.salaryMin,
    { message: 'Maximum salary must be greater than or equal to minimum salary', path: ['salaryMax'] }
  );

export const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(9),
  search: z.string().trim().optional(),
  category: z.enum(JOB_CATEGORIES).optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
  jobType: z.enum(JOB_TYPES).optional(),
  status: z.enum(JOB_STATUSES).optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

export const applyJobSchema = z.object({
  coverLetter: z.string().max(2000).optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;
