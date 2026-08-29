import { Link } from 'react-router-dom';
import { PageTitle } from '../components/ui';

export function NotFoundPage() {
  return (
    <div>
      <PageTitle title="Page Not Found" subtitle="404" crumbs={[{ label: 'Home', to: '/' }]} />
      <div className="container-x flex flex-col items-center py-16 text-center">
        <div className="text-6xl font-black text-[var(--primary)]">404</div>
        <h1 className="mt-3 text-xl font-bold">Page not found</h1>
        <p className="mt-1 max-w-sm text-sm text-slate-500">The page you are looking for doesn't exist or has been moved.</p>
        <div className="mt-6 flex gap-3">
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <Link to="/products" className="btn btn-outline">Browse Products</Link>
        </div>
      </div>
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="container-x flex flex-col items-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" /></svg>
      </div>
      <h1 className="mt-4 text-xl font-bold">Access Denied</h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500">You don't have permission to view this page.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  );
}