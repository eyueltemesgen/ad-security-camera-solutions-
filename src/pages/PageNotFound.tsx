import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function PageNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 text-center max-w-md">
        <Compass className="w-14 h-14 mx-auto mb-4 opacity-40" />
        <h1 className="text-3xl font-bold mb-2">404</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">This page doesn't exist.</p>
        <Link to="/" className="btn-primary px-8 py-2.5 inline-flex">
          Go Home
        </Link>
      </div>
    </div>
  );
}