import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../../lib/api';
import { Spinner } from '../../components/ui';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const saved = (() => {
    try {
      const raw = localStorage.getItem('adsec_reset');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [token, setToken] = useState(saved?.token ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiPost('/api/auth/reset-password', { token, password }, false);
      localStorage.removeItem('adsec_reset');
      setDone(true);
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
            <h1 className="text-xl font-bold">Reset Password</h1>
            <p className="mt-1 text-sm text-slate-500">Choose a new password for your account.</p>
          </div>

          {done ? (
            <div className="rounded-lg bg-emerald-50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-emerald-800">Password reset successfully!</p>
              <Link to="/login" className="btn btn-primary btn-sm mt-4">Login Now</Link>
            </div>
          ) : (
            <>
              {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="label">Reset Token</label>
                  <input
                    className="input font-mono text-xs"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste the token from the email"
                    required
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>
                <button className="btn btn-primary btn-lg w-full" disabled={busy}>
                  {busy ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}