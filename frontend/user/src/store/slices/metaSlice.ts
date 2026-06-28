import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/axios';
import { Meta } from '../../types';

interface MetaState {
  meta: Meta;
}

const initialState: MetaState = {
  meta: { categories: [], experienceLevels: [], jobTypes: [] },
};

export const fetchMeta = createAsyncThunk<Meta>('meta/fetch', async () => {
  const { data } = await api.get('/meta');
  return data.data;
});

const metaSlice = createSlice({
  name: 'meta',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMeta.fulfilled, (state, action) => {
      state.meta = action.payload;
    });
  },
});

export default metaSlice.reducer;
