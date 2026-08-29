import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Spinner } from '../../components/ui';

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.full_name.trim().length < 3) e.full_name = 'Enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.phone.trim() && !/^[+0-9\s-]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const user = await register({ full_name: form.full_name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password });
      toast('Account created. Welcome!');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setErrors({ form: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="card card-pad shadow-sm">
          <div className="mb-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--primary)] text-xl font-black text-[var(--accent)]">AD</span>
            <h1 className="mt-3 text-xl font-bold">Create Your Account</h1>
            <p className="mt-1 text-sm text-slate-500">Track orders, request services and manage your security solutions.</p>
          </div>

          {errors.form && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errors.form}</div>}

          <form onSubmit={submit} noValidate>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={form.full_name} onChange={set('full_name')} placeholder="John Smith" />
                {errors.full_name && <p className="mt-1 text-xs font-medium text-red-600">{errors.full_name}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                {errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={set('phone')} placeholder="+251 9XX XXX XXX" />
                {errors.phone && <p className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Password</label>
                  <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="••••••" />
                  {errors.password && <p className="mt-1 text-xs font-medium text-red-600">{errors.password}</p>}
                </div>
                <div>
                  <label className="label">Confirm</label>
                  <input className="input" type="password" value={form.confirm} onChange={set('confirm')} placeholder="••••••" />
                  {errors.confirm && <p className="mt-1 text-xs font-medium text-red-600">{errors.confirm}</p>}
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-lg mt-5 w-full" disabled={busy}>
              {busy ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--primary)] hover:underline">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}