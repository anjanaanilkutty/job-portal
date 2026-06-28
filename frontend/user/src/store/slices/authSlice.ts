import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { AuthUser } from '../../types';
import { extractErrorMessage } from '../../lib/axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const STORAGE_KEY = 'jobportal_user_auth';

interface PersistedAuth {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

function loadPersisted(): PersistedAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedAuth) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const persisted = loadPersisted();

const initialState: AuthState = {
  user: persisted?.user ?? null,
  accessToken: persisted?.accessToken ?? null,
  refreshToken: persisted?.refreshToken ?? null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk<
  PersistedAuth,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${baseURL}/auth/login`, credentials);
    return data.data as PersistedAuth;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const register = createAsyncThunk<
  PersistedAuth,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${baseURL}/auth/register`, { ...payload, role: 'user' });
    return data.data as PersistedAuth;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<PersistedAuth>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem(STORAGE_KEY);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const onPending = (state: AuthState) => {
      state.status = 'loading';
      state.error = null;
    };
    const onFulfilled = (state: AuthState, action: PayloadAction<PersistedAuth>) => {
      state.status = 'idle';
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    };
    builder
      .addCase(login.pending, onPending)
      .addCase(login.fulfilled, onFulfilled)
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Login failed';
      })
      .addCase(register.pending, onPending)
      .addCase(register.fulfilled, onFulfilled)
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Registration failed';
      });
  },
});

export const { setCredentials, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
