import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCms } from '../hooks/useCms';
import { useProducts, useServices } from '../hooks/useData';
import ProductCard from '../components/home/ProductCard';
import { SectionHeading, Stars, formatMoney } from '../components/ui';
import type { GalleryItem, Testimonial } from '../types';

// --------------------------------------------------------------------------
// Hero
// --------------------------------------------------------------------------
function Hero({ hero }: { hero: Record<string, unknown> }) {
  const heading = String(hero.heading ?? 'Complete Security Solutions for Your Home & Business');
  const subtitle = String(hero.subtitle ?? '');
  const badge = String(hero.badge ?? '');
  const image = String(hero.image ?? '');
  const cta1 = String(hero.cta1_label ?? 'Explore Products');
  const cta2 = String(hero.cta2_label ?? 'Request a Service');
  const cta1Url = String(hero.cta1_url ?? '/products');
  const cta2Url = String(hero.cta2_url ?? '/services');

  return (
    <section className="relative overflow-hidden bg-[var(--primary)] text-white">
      {image ? (
        <div className="absolute inset-0">
          <img src={image} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] via-[var(--primary)]/80 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      )}
      <div className="container-x relative py-20 sm:py-28">
        <div className="max-w-2xl">
          {badge && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {badge}
            </span>
          )}
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-5xl">{heading}</h1>
          {subtitle && <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">{subtitle}</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={cta1Url} className="btn btn-accent btn-lg">{cta1}</Link>
            <Link to={cta2Url} className="btn btn-lg bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20">
              {cta2}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Trust bar
// --------------------------------------------------------------------------
function TrustBar({ data }: { data: Record<string, unknown> }) {
  const items = (data.items ?? []) as { icon?: string; label?: string }[];
  const icons: Record<string, React.ReactNode> = {
    shield: <ShieldIcon />,
    award: <AwardIcon />,
    headphones: <HeadphonesIcon />,
    clock: <ClockIcon />,
    'badge-check': <CheckIcon />,
  };
  if (items.length === 0) return null;
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="container-x grid grid-cols-2 gap-4 py-6 md:grid-cols-5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              {icons[item.icon ?? ''] ?? <ShieldIcon />}
            </span>
            <span className="text-sm font-semibold text-slate-800">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Services section
// --------------------------------------------------------------------------
function ServicesSection({ data }: { data: Record<string, unknown> }) {
  const { services, loading } = useServices();
  const title = String(data.title ?? 'Our Services');
  const subtitle = String(data.subtitle ?? '');
  const showAll = data.show_all !== false;
  const list = showAll ? services : services.filter((s) => s.is_featured).slice(0, 6);

  return (
    <section className="container-x py-16">
      <SectionHeading title={title} subtitle={subtitle} center />
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-52" />)}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <Link key={s.id} to={`/services/${s.slug}`} className="card group p-6 transition-shadow hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--accent)]">
                <ServiceIcon name={s.icon} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{s.name}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{s.short_description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)]">
                Learn More
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function ServiceIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    video: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="6" width="13" height="12" rx="2" /><path d="m22 8-6 4 6 4V8" strokeLinejoin="round" /></svg>,
    network: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="19" r="2.5" /><circle cx="19" cy="19" r="2.5" /><path d="M12 7.5v4M5 16.5v-2h14v2M7.5 14 10 11m6.5 3L14 11" strokeLinecap="round" /></svg>,
    fingerprint: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 11a4 4 0 0 0-4 4v3" strokeLinecap="round" /><path d="M16 11a4 4 0 0 1 4 4v3M8 21v-2m4 2v-3m4 3v-1" strokeLinecap="round" /><path d="M5 15v1m14 0v1" strokeLinecap="round" /><path d="M3 13a9 9 0 0 1 18 0" strokeLinecap="round" /></svg>,
    door: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" strokeLinecap="round" /><path d="M2 21h20M14 12h.01" strokeLinecap="round" /></svg>,
    web: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" /></svg>,
    wrench: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4L15 12l-3-3 2.7-2.7z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    search: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>,
    layers: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m12 2 9 5-9 5-9-5 9-5z" /><path d="m3 12 9 5 9-5" strokeLinecap="round" /><path d="m3 17 9 5 9-5" strokeLinecap="round" /></svg>,
    puzzle: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M19 10V7a2 2 0 0 0-2-2h-3a2 2 0 0 0-4 0H7a2 2 0 0 0-2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0 2 2h3a2 2 0 0 0 4 0h3a2 2 0 0 0 2-2v-3a2 2 0 0 0 0-4z" /></svg>,
    cog: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>,
    shield: <ShieldIcon />,
    smile: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" /><path d="M9 9h.01M15 9h.01" strokeLinecap="round" /></svg>,
  };
  return <>{icons[name] ?? <ShieldIcon />}</>;
}

// --------------------------------------------------------------------------
// Featured products
// --------------------------------------------------------------------------
function FeaturedProducts({ data }: { data: Record<string, unknown> }) {
  const title = String(data.title ?? 'Featured Products');
  const subtitle = String(data.subtitle ?? '');
  const limit = Number(data.limit) || 8;
  const { products, loading } = useProducts({ featured: 'true', per_page: limit });

  return (
    <section className="bg-white py-16">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-sub">{subtitle}</p>}
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">View All Products</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-72" />)}
          </div>
        ) : products.length === 0 ? (
          <p className="py-10 text-center text-slate-400">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Installation section
// --------------------------------------------------------------------------
function Installation({ data }: { data: Record<string, unknown> }) {
  const heading = String(data.heading ?? 'Professional CCTV Installation');
  const subtitle = String(data.subtitle ?? '');
  const steps = (data.steps ?? []) as string[];
  const image = String(data.image ?? '');
  const cta = String(data.cta_label ?? 'Book Installation');
  const ctaUrl = String(data.cta_url ?? '/request-service');

  return (
    <section className="bg-[var(--primary)] py-16 text-white">
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{heading}</h2>
            {subtitle && <p className="mt-4 leading-relaxed text-slate-300">{subtitle}</p>}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-slate-900">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-200">{step}</span>
                </div>
              ))}
            </div>
            <Link to={ctaUrl} className="btn btn-accent btn-lg mt-8">{cta}</Link>
          </div>
          <div className={`relative ${image ? '' : 'overflow-hidden rounded-2xl'}`}>
            {image ? (
              <img src={image} alt={heading} className="h-full w-full rounded-2xl object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white/40">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Why choose us
// --------------------------------------------------------------------------
function WhyChooseUs({ data }: { data: Record<string, unknown> }) {
  const title = String(data.title ?? 'Why Choose Us');
  const subtitle = String(data.subtitle ?? '');
  const items = (data.items ?? []) as { title?: string; body?: string; icon?: string }[];

  return (
    <section className="container-x py-16">
      <SectionHeading title={title} subtitle={subtitle} center />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--accent)]">
              <span className="[&>svg]:h-6 [&>svg]:w-6"><ServiceIcon name={item.icon ?? ''} /></span>
            </span>
            <h3 className="mt-4 font-bold text-slate-900">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// How it works
// --------------------------------------------------------------------------
function HowItWorks({ data }: { data: Record<string, unknown> }) {
  const title = String(data.title ?? 'How It Works');
  const subtitle = String(data.subtitle ?? '');
  const items = (data.items ?? data.steps ?? []) as { title?: string; body?: string }[];

  if (items.length === 0) return null;
  return (
    <section className="bg-white py-16">
      <div className="container-x">
        <SectionHeading title={title} subtitle={subtitle} center />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="relative flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                {item.body && <p className="mt-1 text-sm text-slate-500">{item.body}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Testimonials
// --------------------------------------------------------------------------
function Testimonials({ data }: { data: Record<string, unknown> }) {
  const { site } = useCms();
  const title = String(data.title ?? 'What Our Clients Say');
  const subtitle = String(data.subtitle ?? '');
  const limit = Number(data.limit) || 6;
  const items = (site?.testimonials ?? []).slice(0, limit) as Testimonial[];

  if (items.length === 0) return null;
  return (
    <section className="container-x py-16">
      <SectionHeading title={title} subtitle={subtitle} center />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <div key={t.id} className="card flex flex-col p-6">
            <Stars rating={t.rating} />
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">“{t.content}”</p>
            <div className="mt-5 flex items-center gap-3">
              {t.image_url ? (
                <img src={t.image_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                  {t.name[0]?.toUpperCase()}
                </span>
              )}
              <div>
                <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                {t.company && <div className="text-xs text-slate-500">{t.company}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Gallery
// --------------------------------------------------------------------------
function GalleryPreview({ data }: { data: Record<string, unknown> }) {
  const { site } = useCms();
  const title = String(data.title ?? 'Our Recent Projects');
  const subtitle = String(data.subtitle ?? '');
  const cta = String(data.cta_label ?? 'View Full Gallery');
  const ctaUrl = String(data.cta_url ?? '/gallery');
  const limit = Number(data.limit) || 6;
  const items = (site?.gallery ?? []).slice(0, limit) as GalleryItem[];

  if (items.length === 0) return null;
  return (
    <section className="bg-white py-16">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-sub">{subtitle}</p>}
          </div>
          <Link to={ctaUrl} className="btn btn-outline btn-sm">{cta}</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((g) => (
            <Link key={g.id} to={ctaUrl} className="group relative aspect-[4/3] overflow-hidden rounded-xl">
              {g.image_url ? (
                <img src={g.image_url} alt={g.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100 text-slate-300">No image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-3 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                <div className="text-sm font-semibold text-white">{g.title}</div>
                <div className="text-xs text-slate-300">{g.category}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// FAQ preview
// --------------------------------------------------------------------------
function FaqPreview({ data }: { data: Record<string, unknown> }) {
  const { site } = useCms();
  const title = String(data.title ?? 'Frequently Asked Questions');
  const subtitle = String(data.subtitle ?? '');
  const limit = Number(data.limit) || 5;
  const items = (site?.faqs ?? []).slice(0, limit);

  if (items.length === 0) return null;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="container-x py-16">
      <SectionHeading title={title} subtitle={subtitle} center />
      <div className="mx-auto max-w-3xl space-y-3">
        {items.map((f, i) => (
          <div key={f.id} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="font-semibold text-slate-800">{f.question}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`shrink-0 text-slate-400 transition-transform ${open === i ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {open === i && <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-500">{f.answer}</div>}
          </div>
        ))}
        <div className="pt-2 text-center">
          <Link to="/faq" className="text-sm font-semibold text-[var(--primary)] hover:underline">View all FAQs</Link>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Final CTA
// --------------------------------------------------------------------------
function FinalCta({ data }: { data: Record<string, unknown> }) {
  const heading = String(data.heading ?? 'Protect What Matters Most');
  const subtitle = String(data.subtitle ?? '');
  const cta1 = String(data.cta1_label ?? 'Request Service');
  const cta2 = String(data.cta2_label ?? 'Shop Products');
  const cta1Url = String(data.cta1_url ?? '/request-service');
  const cta2Url = String(data.cta2_url ?? '/products');
  const image = String(data.image ?? '');

  return (
    <section className="relative overflow-hidden bg-[var(--primary)] py-20 text-center text-white">
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
      <div className="absolute inset-0 bg-[var(--primary)]/70" />
      <div className="container-x relative">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{heading}</h2>
        {subtitle && <p className="mx-auto mt-4 max-w-xl text-slate-300">{subtitle}</p>}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to={cta1Url} className="btn btn-accent btn-lg">{cta1}</Link>
          <Link to={cta2Url} className="btn btn-lg bg-white text-[var(--primary)] hover:bg-white/90">{cta2}</Link>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Icons
// --------------------------------------------------------------------------
function ShieldIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function AwardIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="6" /><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function HeadphonesIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 14v-2a9 9 0 0 1 18 0v2" strokeLinecap="round" /><rect x="2" y="14" width="4" height="7" rx="2" /><rect x="18" y="14" width="4" height="7" rx="2" /></svg>;
}
function ClockIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>;
}
function CheckIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" strokeLinecap="round" strokeLinejoin="round" /><path d="m9 11 3 3L22 4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

// --------------------------------------------------------------------------
export default function HomePage() {
  const { hero, servicesSection, featuredProductsSection, installation, whyChooseUs, howItWorks, testimonialsSection, gallerySection, faqSection, finalCta, site } = useCms();

  return (
    <div>
      {hero?.visible !== false && <Hero hero={hero ?? {}} />}
      <TrustBar data={site?.homepage.find((s) => s.slug === 'trust')?.content ?? {}} />
      {servicesSection?.visible !== false && <ServicesSection data={servicesSection ?? {}} />}
      {featuredProductsSection?.visible !== false && <FeaturedProducts data={featuredProductsSection ?? {}} />}
      {installation?.visible !== false && <Installation data={installation ?? {}} />}
      {whyChooseUs?.visible !== false && <WhyChooseUs data={whyChooseUs ?? {}} />}
      {howItWorks?.visible !== false && <HowItWorks data={howItWorks ?? {}} />}
      {testimonialsSection?.visible !== false && <Testimonials data={testimonialsSection ?? {}} />}
      {gallerySection?.visible !== false && <GalleryPreview data={gallerySection ?? {}} />}
      {faqSection?.visible !== false && <FaqPreview data={faqSection ?? {}} />}
      {finalCta?.visible !== false && <FinalCta data={finalCta ?? {}} />}
    </div>
  );
}