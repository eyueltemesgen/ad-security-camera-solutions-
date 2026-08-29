import { useMemo, useState } from 'react';
import { useCms } from '../hooks/useCms';
import { EmptyState, PageTitle } from '../components/ui';

const CATEGORY_COLORS: Record<string, string> = {};

export default function GalleryPage() {
  const { site } = useCms();
  const items = site?.gallery ?? [];
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((g) => set.add(g.category));
    return [...set];
  }, [items]);

  const filtered = useMemo(
    () => (category === 'all' ? items : items.filter((g) => g.category === category)),
    [items, category],
  );

  return (
    <div>
      <PageTitle
        title="Gallery"
        subtitle="A selection of real security installations and projects by our team."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Gallery' }]}
      />
      <div className="container-x py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            className={`btn btn-sm ${category === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCategory('all')}
          >
            All
          </button>
          {categories.map((c) => (
            <button key={c} className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No photos yet" subtitle="Our gallery will be updated with recent projects." />
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>div]:mb-4">
            {filtered.map((g) => (
              <figure key={g.id} className="card overflow-hidden break-inside-avoid">
                {g.image_url ? (
                  <img src={g.image_url} alt={g.title} loading="lazy" className="w-full object-cover" />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-slate-100 text-slate-300">No image</div>
                )}
                <figcaption className="p-4">
                  <span className="badge status-confirmed">{g.category}</span>
                  <h3 className="mt-2 font-semibold text-slate-900">{g.title}</h3>
                  {g.description && <p className="mt-1 text-sm text-slate-500">{g.description}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}