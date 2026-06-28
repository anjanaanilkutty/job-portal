import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, extractErrorMessage } from '../../lib/axios';
import { Job, JobFilters, Pagination } from '../../types';

interface JobState {
  items: Job[];
  featured: Job[];
  current: Job | null;
  pagination: Pagination;
  filters: JobFilters;
  listStatus: 'idle' | 'loading' | 'failed';
  detailStatus: 'idle' | 'loading' | 'failed';
  error: string | null;
}

export const initialFilters: JobFilters = {
  page: 1,
  limit: 9,
  search: '',
  category: '',
  experienceLevel: '',
  jobType: '',
  sort: 'newest',
};

const initialState: JobState = {
  items: [],
  featured: [],
  current: null,
  pagination: { page: 1, limit: 9, total: 0, totalPages: 1 },
  filters: initialFilters,
  listStatus: 'idle',
  detailStatus: 'idle',
  error: null,
};

function toParams(filters: JobFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
    sort: filters.sort ?? 'newest',
    status: 'open',
  };
  if (filters.search) params.search = filters.search;
  if (filters.category) params.category = filters.category;
  if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
  if (filters.jobType) params.jobType = filters.jobType;
  return params;
}

export const fetchJobs = createAsyncThunk<
  { data: Job[]; pagination: Pagination },
  JobFilters,
  { rejectValue: string }
>('jobs/fetch', async (filters, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/jobs', { params: toParams(filters) });
    return { data: data.data, pagination: data.pagination };
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const fetchFeaturedJobs = createAsyncThunk<Job[], void, { rejectValue: string }>(
  'jobs/featured',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/jobs', {
        params: { featured: 'true', status: 'open', limit: 6, page: 1 },
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchJobById = createAsyncThunk<Job, number, { rejectValue: string }>(
  'jobs/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<JobFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialFilters;
    },
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.listStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.listStatus = 'idle';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.payload ?? 'Failed to load jobs';
      })
      .addCase(fetchFeaturedJobs.fulfilled, (state, action) => {
        state.featured = action.payload;
      })
      .addCase(fetchJobById.pending, (state) => {
        state.detailStatus = 'loading';
        state.current = null;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.detailStatus = 'idle';
        state.current = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.payload ?? 'Failed to load job';
      });
  },
});

export const { setFilters, resetFilters, clearCurrent } = jobSlice.actions;
export default jobSlice.reducer;
