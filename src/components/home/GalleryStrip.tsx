import { Link } from 'react-router-dom';
import { Images } from 'lucide-react';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useReveal } from '../../hooks/useReveal';

export function GalleryStrip() {
  const { gallery } = useSiteContent();
  const ref = useReveal<HTMLDivElement>();

  const items = gallery.filter((g) => g.is_active && g.image_url).slice(0, 6);

  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8" ref={ref}>
          <div>
            <span className="section-eyebrow flex items-center gap-1.5">
              <Images className="w-3 h-3" /> Gallery
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
              Recent <span className="text-gradient">Installations</span>
            </h2>
          </div>
          <Link to="/gallery" className="hidden sm:inline-flex text-sm font-medium border-b-2 pb-0.5 hover:text-brand-400" style={{ color: 'var(--text-secondary)', borderColor: 'transparent' }}>
            View all →
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Gallery coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <Link
                key={item.id}
                to="/gallery"
                className="group relative rounded-2xl overflow-hidden aspect-[4/3]"
              >
                <img
                  src={item.image_url}
                  alt={item.title ?? 'Installation'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-sm font-medium">{item.title}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-6 sm:hidden">
          <Link to="/gallery" className="text-sm font-medium text-brand-400">View all gallery →</Link>
        </div>
      </div>
    </section>
  );
}