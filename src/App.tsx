import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DatabaseZap } from 'lucide-react';
import { isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { AccountPage } from './pages/AccountPage';

// Admin (recharts + management UI) is code-split to keep the storefront light
const AdminApp = lazy(() => import('./pages/admin/AdminApp').then((m) => ({ default: m.AdminApp })));

export function App() {
  if (!isSupabaseConfigured) {
    return <SetupNotice />;
  }
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-gray-400">Loading admin…</div>}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-2">404</h1>
        <p className="text-gray-400 mb-6">This page doesn't exist.</p>
        <a href="/" className="btn-primary px-8 py-2.5">
          Go Home
        </a>
      </div>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-night">
      <div className="glass-card rounded-2xl p-8 max-w-lg text-center">
        <DatabaseZap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-3">Supabase setup required</h2>
        <p className="text-sm text-gray-400 mb-4">
          This app needs a Supabase project. Set the environment variables and restart the dev
          server:
        </p>
        <ol className="text-left text-sm text-gray-300 space-y-2 mb-4">
          <li>1. Create a project at <span className="text-blue-400">supabase.com</span></li>
          <li>
            2. Run the SQL in <code className="text-blue-300">supabase/migrations/</code> (or use
            the Supabase CLI)
          </li>
          <li>
            3. Copy <code className="text-blue-300">.env.example</code> to{' '}
            <code className="text-blue-300">.env</code> and fill in your Project URL + anon key
          </li>
          <li>4. Restart the dev server</li>
        </ol>
        <p className="text-xs text-gray-500">
          See <code className="text-blue-300">README.md</code> for the full setup guide.
        </p>
      </div>
    </div>
  );
}
