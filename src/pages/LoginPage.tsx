import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export function LoginPage() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setNeedsConfirmation(false);
    setBusy(true);
    const { error: authError } = await signIn(form.email, form.password);
    setBusy(false);
    if (authError) {
      setError(authError);
      if (authError.includes('not confirmed')) setNeedsConfirmation(true);
      return;
    }
    showToast('Welcome back!', 'success');
    navigate('/account');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <LogIn className="w-6 h-6 text-blue-400" /> Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="form-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="form-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {notice && <p className="text-emerald-400 text-sm text-center">{notice}</p>}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full py-3">
            {busy ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <div className="text-center text-sm mt-4 space-y-2">
          <Link to="/forgot-password" className="block text-blue-400 hover:text-blue-300">
            Forgot password?
          </Link>
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}