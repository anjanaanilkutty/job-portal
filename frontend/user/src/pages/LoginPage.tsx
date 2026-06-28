import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, register, clearAuthError } from '../store/slices/authSlice';
import { fetchMyApplications } from '../store/slices/applicationSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error, accessToken } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const redirectTo = (location.state as LocationState)?.from?.pathname ?? '/jobs';

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchMyApplications());
      navigate(redirectTo, { replace: true });
    }
  }, [accessToken, navigate, redirectTo, dispatch]);

  useEffect(() => {
    dispatch(clearAuthError());
    setFieldErrors({});
  }, [mode, dispatch]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (mode === 'register' && name.trim().length < 2) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
    if (!password) errors.password = 'Password is required';
    else if (mode === 'register' && password.length < 6)
      errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (mode === 'login') {
      dispatch(login({ email, password }));
    } else {
      dispatch(register({ name, email, password }));
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login'
              ? 'Sign in to apply for jobs and track applications'
              : 'Join to start applying for jobs in seconds'}
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === 'register' && (
            <Input
              label="Full name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              placeholder="Jane Doe"
            />
          )}
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            placeholder="••••••••"
          />
          <Button type="submit" className="w-full" isLoading={status === 'loading'}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="font-medium text-brand-600 hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {mode === 'login' && (
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">
            Demo candidate: <span className="font-medium">user@jobportal.test</span> / user1234
          </p>
        )}
      </div>

      <Link to="/" className="mt-6 text-center text-sm text-slate-400 hover:text-slate-600">
        ← Back to home
      </Link>
    </div>
  );
}
