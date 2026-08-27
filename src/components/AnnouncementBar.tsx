import { Megaphone, X } from 'lucide-react';
import { useState } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';

/** Displays the first active, in-date announcement. Dismissible per session. */
export function AnnouncementBar() {
  const { announcements } = useSiteContent();
  const [dismissed, setDismissed] = useState(false);

  const now = new Date();
  const announcement = announcements.find((a) => {
    if (a.start_date && new Date(a.start_date) > now) return false;
    if (a.end_date && new Date(a.end_date) < now) return false;
    return true;
  });

  if (!announcement || dismissed) return null;

  return (
    <div
      className="w-full text-white text-center text-sm font-medium px-10 py-2 relative"
      style={{ background: 'linear-gradient(145deg, #1f5740, #123a21)' }}
    >
      <div className="max-w-5xl mx-auto flex items-center gap-2 justify-center">
        <Megaphone className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">
          {announcement.title}
          {announcement.message ? ` — ${announcement.message}` : ''}
        </span>
        {announcement.cta_url && (
          <a href={announcement.cta_url} className="underline font-semibold whitespace-nowrap">
            {announcement.cta_label || 'Learn more'}
          </a>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:opacity-70"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}