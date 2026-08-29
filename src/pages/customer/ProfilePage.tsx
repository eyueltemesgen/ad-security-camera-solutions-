import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { apiPost, apiUpload, apiPut } from '../../lib/api';
import { Spinner } from '../../components/ui';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '', avatar_url: '' });
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) setProfile({ full_name: user.full_name ?? '', email: user.email ?? '', phone: user.phone ?? '', avatar_url: user.avatar_url ?? '' });
  }, [user]);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload<{ url: string }>('/api/uploads/image', fd);
      const updated = await updateProfile({ avatar_url: res.url });
      setProfile((p) => ({ ...p, avatar_url: updated.avatar_url ?? '' }));
      toast('Profile picture updated');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (profile.full_name.trim().length < 3) errs.full_name = 'Name is too short';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errs.email = 'Enter a valid email';
    if (profile.phone.trim() && !/^[+0-9\s-]{7,15}$/.test(profile.phone)) errs.phone = 'Enter a valid phone';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingProfile(true);
    try {
      const updated = await updateProfile({ full_name: profile.full_name.trim(), phone: profile.phone.trim() });
      setProfile((p) => ({ ...p, full_name: updated.full_name ?? '', email: updated.email ?? '', phone: updated.phone ?? '' }));
      toast('Profile saved');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (pw.new_password.length < 6) errs.new_password = 'Password must be at least 6 characters';
    if (pw.new_password !== pw.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingPw(true);
    try {
      await changePassword(pw.current_password, pw.new_password);
      setPw({ current_password: '', new_password: '', confirm: '' });
      toast('Password changed');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your personal information and password.</p>

      <div className="card card-pad mt-6">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] text-xl font-bold text-white">
              {profile.full_name[0]?.toUpperCase() ?? 'U'}
            </span>
          )}
          <div>
            <label className="btn btn-outline btn-sm cursor-pointer">
              {uploading ? <Spinner className="h-4 w-4" /> : 'Upload Picture'}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </label>
            {profile.avatar_url && (
              <button className="ml-2 text-xs font-medium text-red-600 hover:underline">Remove</button>
            )}
          </div>
        </div>

        <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} />
            {errors.full_name && <p className="mt-1 text-xs font-medium text-red-600">{errors.full_name}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="label">Email <span className="font-normal text-slate-400">(login email)</span></label>
            <input className="input cursor-not-allowed bg-slate-50" type="email" value={profile.email} disabled />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Phone</label>
            <input className="input" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            {errors.phone && <p className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p>}
          </div>
          <div className="sm:col-span-2">
            <button className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="card card-pad mt-6">
        <h2 className="font-bold">Change Password</h2>
        <form onSubmit={savePassword} className="mt-4 grid gap-4 sm:grid-cols-3" noValidate>
          <div>
            <label className="label">Current Password</label>
            <input className="input" type="password" value={pw.current_password} onChange={(e) => setPw((p) => ({ ...p, current_password: e.target.value }))} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" value={pw.new_password} onChange={(e) => setPw((p) => ({ ...p, new_password: e.target.value }))} required />
            {errors.new_password && <p className="mt-1 text-xs font-medium text-red-600">{errors.new_password}</p>}
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input className="input" type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} required />
            {errors.confirm && <p className="mt-1 text-xs font-medium text-red-600">{errors.confirm}</p>}
          </div>
          <div className="sm:col-span-3">
            <button className="btn btn-primary" disabled={savingPw}>
              {savingPw ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}