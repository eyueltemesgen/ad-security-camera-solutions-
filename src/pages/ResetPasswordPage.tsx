import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    const resetError = await updatePassword(form.password);
    setBusy(false);
    if (resetError) {
      setError(resetError);
      return;
    }
    showToast('Password updated — please log in.', 'success');
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-2 text-center flex items-center justify-center gap-2">
          <Lock className="w-6 h-6 text-blue-400" /> Set a New Password
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            required
            minLength={6}
            className="form-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            required
            className="form-input"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full py-3">
            {busy ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}