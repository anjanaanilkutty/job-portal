import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, extractErrorMessage } from '../../lib/axios';
import { DashboardStats, Meta } from '../../types';

interface MetaState {
  meta: Meta;
  stats: DashboardStats | null;
  statsStatus: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: MetaState = {
  meta: { categories: [], experienceLevels: [], jobTypes: [] },
  stats: null,
  statsStatus: 'idle',
  error: null,
};

export const fetchMeta = createAsyncThunk<Meta>('meta/fetch', async () => {
  const { data } = await api.get('/meta');
  return data.data;
});

export const fetchDashboardStats = createAsyncThunk<DashboardStats, void, { rejectValue: string }>(
  'meta/stats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/jobs/stats/overview');
      return data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const metaSlice = createSlice({
  name: 'meta',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeta.fulfilled, (state, action) => {
        state.meta = action.payload;
      })
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsStatus = 'idle';
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsStatus = 'failed';
        state.error = action.payload ?? 'Failed to load dashboard stats';
      });
  },
});

export default metaSlice.reducer;
