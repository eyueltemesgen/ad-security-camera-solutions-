import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStorefront } from '../../hooks/useStorefront';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../ui';

export function AuthModal() {
  const { modal, closeModal } = useStorefront();
  const open = modal === 'auth';
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const message = await signIn(loginForm.email, loginForm.password);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    showToast('Welcome back!', 'success');
    closeModal();
    navigate('/account');
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (registerForm.password !== registerForm.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    const message = await signUp({
      fullName: registerForm.name,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
    });
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    showToast('Account created — welcome!', 'success');
    closeModal();
    navigate('/account');
  };

  return (
    <Modal open={open} onClose={closeModal}>
      {mode === 'login' ? (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
            <LogIn className="w-6 h-6 text-blue-400" /> Welcome Back
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="form-input"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="form-input"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <button type="submit" disabled={busy} className="btn-primary w-full py-3">
              {busy ? 'Signing in…' : 'Login'}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
          <p className="text-center text-sm text-gray-400 mt-4">
            Don't have an account?{' '}
            <button onClick={() => { setMode('register'); setError(null); }} className="text-blue-400 hover:text-blue-300">
              Register
            </button>
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
            <UserPlus className="w-6 h-6 text-emerald-400" /> Create Account
          </h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              required
              className="form-input"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              required
              className="form-input"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              className="form-input"
              value={registerForm.phone}
              onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              required
              minLength={6}
              className="form-input"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              required
              className="form-input"
              value={registerForm.confirm}
              onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })}
            />
            <button type="submit" disabled={busy} className="btn-success w-full py-3">
              {busy ? 'Creating account…' : 'Register'}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <button onClick={() => { setMode('login'); setError(null); }} className="text-blue-400 hover:text-blue-300">
              Login
            </button>
          </p>
        </div>
      )}
    </Modal>
  );
}
