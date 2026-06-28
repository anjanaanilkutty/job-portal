export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
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
  postedBy: number;
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
  status?: JobStatus;
  sort?: 'newest' | 'oldest';
}

export interface Meta {
  categories: string[];
  experienceLevels: string[];
  jobTypes: string[];
}

export interface DashboardStats {
  totals: {
    totalJobs: number;
    openJobs: number;
    closedJobs: number;
    totalApplications: number;
    totalUsers: number;
  };
  byCategory: { category: string; count: string }[];
  recentJobs: Job[];
}

export interface ApiValidationDetail {
  field: string;
  message: string;
}
