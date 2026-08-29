import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Spinner } from '../../components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await login(email, password);
      if (res.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="card card-pad shadow-sm">
          <div className="mb-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--primary)] text-xl font-black text-[var(--accent)]">AD</span>
            <h1 className="mt-3 text-xl font-bold">Welcome Back</h1>
            <p className="mt-1 text-sm text-slate-500">Login to your customer account</p>
          </div>

          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

          <form onSubmit={submit} noValidate>
            <div className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <button className="btn btn-primary btn-lg mt-5 w-full" disabled={busy}>
              {busy ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Login'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm font-medium text-[var(--primary)] hover:underline">Forgot password?</Link>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[var(--primary)] hover:underline">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}