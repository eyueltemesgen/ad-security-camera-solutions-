import { useMemo, useState } from 'react';
import { useCms } from '../hooks/useCms';
import { EmptyState, PageTitle } from '../components/ui';

export default function FaqPage() {
  const { site } = useCms();
  const items = site?.faqs ?? [];
  const [category, setCategory] = useState('all');
  const [open, setOpen] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((f) => set.add(f.category));
    return [...set];
  }, [items]);

  const filtered = useMemo(
    () => (category === 'all' ? items : items.filter((f) => f.category === category)),
    [items, category],
  );

  return (
    <div>
      <PageTitle
        title="Frequently Asked Questions"
        subtitle="Answers to common questions about our products, services and support."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]}
      />
      <div className="container-x py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          <button className={`btn btn-sm ${category === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCategory('all')}>All</button>
          {categories.map((c) => (
            <button key={c} className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No FAQs yet" />
        ) : (
          <div className="mx-auto max-w-3xl space-y-3">
            {filtered.map((f) => (
              <div key={f.id} className="card overflow-hidden">
                <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpen(open === f.id ? null : f.id)}>
                  <span className="font-semibold text-slate-800">{f.question}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`shrink-0 text-slate-400 transition-transform ${open === f.id ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {open === f.id && <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-500">{f.answer}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}