import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiPost } from '../../lib/api';
import { Spinner } from '../../components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await apiPost<{ reset_token?: string; message: string }>('/api/auth/forgot-password', { email }, false);
      setSent(true);
      localStorage.setItem('adsec_reset', JSON.stringify({ email, token: res.reset_token ?? null }));
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
            <h1 className="text-xl font-bold">Forgot Password</h1>
            <p className="mt-1 text-sm text-slate-500">Enter your email and we'll send you a reset link.</p>
          </div>

          {sent ? (
            <div className="rounded-lg bg-emerald-50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-emerald-800">
                If an account exists for <span className="font-bold">{email}</span>, a password reset token has been generated.
              </p>
              <p className="mt-2 text-xs text-emerald-600">
                In this demo environment the reset token is shown below (in production it is emailed).
              </p>
              <Link to="/reset-password" className="btn btn-primary btn-sm mt-4">Continue to Reset Password</Link>
            </div>
          ) : (
            <>
              {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
              <form onSubmit={submit}>
                <label className="label">Email Address</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button className="btn btn-primary btn-lg mt-5 w-full" disabled={busy}>
                  {busy ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          <div className="mt-5 text-center text-sm">
            <Link to="/login" className="font-medium text-[var(--primary)] hover:underline">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}