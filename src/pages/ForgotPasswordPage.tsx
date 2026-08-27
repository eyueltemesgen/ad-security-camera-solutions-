import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    const resetError = await sendPasswordReset(email);
    setBusy(false);
    if (resetError) {
      setError(resetError);
      return;
    }
    setMessage('If an account exists for that email, a reset link has been sent. Check your inbox (and spam).');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-2 text-center flex items-center justify-center gap-2">
          <KeyRound className="w-6 h-6 text-blue-400" /> Reset Password
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Enter your email and we'll send you a reset link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {message && <p className="text-emerald-400 text-sm text-center">{message}</p>}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full py-3">
            {busy ? 'Sending link…' : 'Send Reset Link'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-4">
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}