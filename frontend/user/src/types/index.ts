export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export type JobStatus = 'open' | 'closed';

export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  category: string;
  experienceLevel: string;
  jobType: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  isFeatured: boolean;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JobFilters {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  experienceLevel?: string;
  jobType?: string;
  sort?: 'newest' | 'oldest';
}

export interface Meta {
  categories: string[];
  experienceLevels: string[];
  jobTypes: string[];
}

export interface Application {
  id: number;
  jobId: number;
  userId: number;
  coverLetter: string | null;
  status: string;
  createdAt: string;
  job?: Job;
}
