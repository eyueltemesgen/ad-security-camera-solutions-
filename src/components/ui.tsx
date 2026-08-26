import type { ReactNode } from 'react';
import { Loader2, PackageOpen, Star, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
    </div>
  );
}

export function EmptyState({ message, icon, action }: { message: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-3">
      {icon ?? <PackageOpen className="w-14 h-14 opacity-30" />}
      <p>{message}</p>
      {action}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <p className="text-red-400 text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-3 text-sm py-1.5 px-4">
          Retry
        </button>
      )}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  wide,
  children,
}: {
  open: boolean;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={cn('modal-content glass-card p-6 relative', wide && 'modal-content-wide')}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  );
}

/** Yellow star rating (read-only). */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'w-3.5 h-3.5',
            i <= rounded ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
          )}
        />
      ))}
    </span>
  );
}
