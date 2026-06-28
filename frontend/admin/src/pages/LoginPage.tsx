import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginAdmin, clearAuthError } from '../store/slices/authSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, accessToken, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (accessToken && user?.role === 'admin') {
      navigate('/', { replace: true });
    }
  }, [accessToken, user, navigate]);

  useEffect(() => () => void dispatch(clearAuthError()), [dispatch]);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
    if (!password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(loginAdmin({ email, password }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">
            J
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Manage job postings and applications</p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="admin@jobportal.test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <Button type="submit" className="w-full" isLoading={status === 'loading'}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">
          Demo admin: <span className="font-medium">admin@jobportal.test</span> / admin123
        </p>
      </div>
    </div>
  );
}
