import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * iOS-style bottom sheet on mobile, centered modal on desktop.
 * Slides up from the bottom, dismissible via the grab handle / backdrop / close.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // next frame so the transition runs
      const id = requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = 'hidden';
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    document.body.style.overflow = '';
    return undefined;
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 md:inset-x-auto md:left-1/2 md:top-1/2 md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2',
          'md:w-full md:max-w-lg rounded-t-3xl md:rounded-3xl border-t md:border shadow-2xl',
          'max-h-[92vh] md:max-h-[88vh] overflow-y-auto transition-transform duration-300 ease-out',
          visible ? 'translate-y-0 md:translate-y-[-50%]' : 'translate-y-full md:translate-y-[-40%]'
        )}
        style={{
          background: 'var(--bg-panel)',
          borderColor: 'var(--border-soft)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab handle (mobile) */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-medium)' }} />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 md:pt-5 pb-3">
          {title ? <div className="font-bold text-lg">{title}</div> : <div />}
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-500/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 pb-8 md:pb-6">{children}</div>
      </div>
    </div>
  );
}
