import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

export function GalleryPage() {
  const { gallery } = useSiteContent();
  const [active, setActive] = useState<number | null>(null);

  const items = gallery.filter((g) => g.is_active);

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="section-eyebrow">
            <Camera className="w-3 h-3" /> Gallery
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2">
            Our <span className="text-gradient">Work</span>
          </h1>
          <p className="mt-2 text-sm md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Trusted installations across homes and businesses
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-center" style={{ color: 'var(--text-muted)' }}>No gallery items yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActive(i)}
                className="relative group rounded-xl overflow-hidden aspect-square bg-white/5"
              >
                <img src={item.image_url} alt={item.title ?? 'Gallery image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-white text-sm font-medium text-left">{item.title}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {active != null && items[active] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setActive(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
          <figure className="max-w-4xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img src={items[active].image_url} alt={items[active].title ?? ''} className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl" />
            {items[active].title && (
              <figcaption className="text-white text-sm text-center mt-3">{items[active].title}</figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}