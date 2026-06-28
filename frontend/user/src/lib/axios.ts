import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = store.getState().auth;
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
  const payload = data.data;
  store.dispatch(
    setCredentials({
      user: payload.user,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    })
  );
  return payload.accessToken as string;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; details?: { field: string; message: string }[] }
      | undefined;
    if (data?.details?.length) {
      return data.details.map((d) => d.message).join(', ');
    }
    return data?.message ?? error.message;
  }
  return 'Something went wrong. Please try again.';
}
