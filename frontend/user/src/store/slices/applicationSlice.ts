import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, extractErrorMessage } from '../../lib/axios';
import { Application } from '../../types';

interface ApplicationState {
  myApplications: Application[];
  appliedJobIds: number[];
  submitStatus: 'idle' | 'loading' | 'failed';
  listStatus: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: ApplicationState = {
  myApplications: [],
  appliedJobIds: [],
  submitStatus: 'idle',
  listStatus: 'idle',
  error: null,
};

export const applyToJob = createAsyncThunk<
  Application,
  { jobId: number; coverLetter?: string },
  { rejectValue: string }
>('applications/apply', async ({ jobId, coverLetter }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/jobs/${jobId}/apply`, { coverLetter });
    return data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const fetchMyApplications = createAsyncThunk<Application[], void, { rejectValue: string }>(
  'applications/mine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/applications/me');
      return data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const checkApplicationStatus = createAsyncThunk<
  { jobId: number; hasApplied: boolean },
  number,
  { rejectValue: string }
>('applications/status', async (jobId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/jobs/${jobId}/application-status`);
    return { jobId, hasApplied: data.data.hasApplied };
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearApplicationError(state) {
      state.error = null;
    },
    resetApplications(state) {
      state.myApplications = [];
      state.appliedJobIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyToJob.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.submitStatus = 'idle';
        if (!state.appliedJobIds.includes(action.payload.jobId)) {
          state.appliedJobIds.push(action.payload.jobId);
        }
      })
      .addCase(applyToJob.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload ?? 'Failed to submit application';
      })
      .addCase(fetchMyApplications.pending, (state) => {
        state.listStatus = 'loading';
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.listStatus = 'idle';
        state.myApplications = action.payload;
        state.appliedJobIds = action.payload.map((a) => a.jobId);
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.payload ?? 'Failed to load applications';
      })
      .addCase(checkApplicationStatus.fulfilled, (state, action) => {
        if (action.payload.hasApplied && !state.appliedJobIds.includes(action.payload.jobId)) {
          state.appliedJobIds.push(action.payload.jobId);
        }
      });
  },
});

export const { clearApplicationError, resetApplications } = applicationSlice.actions;
export default applicationSlice.reducer;
