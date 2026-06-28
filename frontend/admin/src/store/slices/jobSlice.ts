import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, extractErrorMessage } from '../../lib/axios';
import { Job, JobFilters, Pagination } from '../../types';

interface JobState {
  items: Job[];
  current: Job | null;
  pagination: Pagination;
  filters: JobFilters;
  listStatus: 'idle' | 'loading' | 'failed';
  mutateStatus: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialFilters: JobFilters = {
  page: 1,
  limit: 8,
  search: '',
  category: '',
  experienceLevel: '',
  jobType: '',
  status: undefined,
  sort: 'newest',
};

const initialState: JobState = {
  items: [],
  current: null,
  pagination: { page: 1, limit: 8, total: 0, totalPages: 1 },
  filters: initialFilters,
  listStatus: 'idle',
  mutateStatus: 'idle',
  error: null,
};

function toParams(filters: JobFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
    sort: filters.sort ?? 'newest',
  };
  if (filters.search) params.search = filters.search;
  if (filters.category) params.category = filters.category;
  if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
  if (filters.jobType) params.jobType = filters.jobType;
  if (filters.status) params.status = filters.status;
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

export const createJob = createAsyncThunk<Job, Partial<Job>, { rejectValue: string }>(
  'jobs/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/jobs', payload);
      return data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateJob = createAsyncThunk<
  Job,
  { id: number; payload: Partial<Job> },
  { rejectValue: string }
>('jobs/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/jobs/${id}`, payload);
    return data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const deleteJob = createAsyncThunk<number, number, { rejectValue: string }>(
  'jobs/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/jobs/${id}`);
      return id;
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
    clearJobError(state) {
      state.error = null;
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
      .addCase(fetchJobById.pending, (state) => {
        state.listStatus = 'loading';
        state.current = null;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.listStatus = 'idle';
        state.current = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.payload ?? 'Failed to load job';
      })
      .addCase(createJob.pending, (state) => {
        state.mutateStatus = 'loading';
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state) => {
        state.mutateStatus = 'idle';
      })
      .addCase(createJob.rejected, (state, action) => {
        state.mutateStatus = 'failed';
        state.error = action.payload ?? 'Failed to create job';
      })
      .addCase(updateJob.pending, (state) => {
        state.mutateStatus = 'loading';
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.mutateStatus = 'idle';
        state.current = action.payload;
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.mutateStatus = 'failed';
        state.error = action.payload ?? 'Failed to update job';
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.items = state.items.filter((job) => job.id !== action.payload);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to delete job';
      });
  },
});

export const { setFilters, resetFilters, clearCurrent, clearJobError } = jobSlice.actions;
export default jobSlice.reducer;
