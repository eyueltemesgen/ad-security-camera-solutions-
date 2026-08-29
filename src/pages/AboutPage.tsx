import { Link } from 'react-router-dom';
import { useCms } from '../hooks/useCms';
import { PageTitle } from '../components/ui';

export default function AboutPage() {
  const { site, brand } = useCms();
  const page = site?.pages.find((p) => p.slug === 'about');
  const content = page?.content ?? {};
  const stats = (content.stats ?? []) as { value: string; label: string }[];
  const values = (content.values ?? []) as { title: string; body: string }[];

  const heading = String(content.heading ?? 'About ' + String(brand.company_name ?? 'AD Security Camera Solution'));
  const story = String(content.story ?? brand.company_description ?? '');
  const mission = String(content.mission ?? '');
  const vision = String(content.vision ?? '');
  const mainImage = String(content.main_image ?? '');
  const ctaLabel = String(content.cta_label ?? 'Request a Service');
  const ctaUrl = String(content.cta_url ?? '/request-service');

  return (
    <div>
      <PageTitle
        title={page?.title ?? heading}
        subtitle={page?.subtitle ?? String(content.subtitle ?? 'Your trusted partner in security and technology.')}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      />
      <div className="container-x py-10">
        {/* Story */}
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Who We Are</h2>
            <div className="prose-cms mt-4">
              <p>{story}</p>
              {mission && (
                <>
                  <h3>Our Mission</h3>
                  <p>{mission}</p>
                </>
              )}
              {vision && (
                <>
                  <h3>Our Vision</h3>
                  <p>{vision}</p>
                </>
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl">
            {mainImage ? (
              <img src={mainImage} alt={heading} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-[var(--primary)]/5">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-[var(--primary)]/40"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="13" r="3" /></svg>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="text-3xl font-extrabold text-[var(--primary)]">{s.value}</div>
                <div className="mt-1 text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Values */}
        {values.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-6 text-xl font-bold">Our Values</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((v, i) => (
                <div key={i} className="card p-6">
                  <h3 className="font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 rounded-2xl bg-[var(--primary)] p-10 text-center text-white">
          <h2 className="text-2xl font-bold text-white">Let's secure your property</h2>
          <p className="mx-auto mt-2 max-w-lg text-slate-300">Talk to our team about a custom security solution for your home or business.</p>
          <Link to={ctaUrl} className="btn btn-accent btn-lg mt-6">{ctaLabel}</Link>
        </div>
      </div>
    </div>
  );
}