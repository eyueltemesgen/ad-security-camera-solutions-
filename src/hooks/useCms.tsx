import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiGet } from '../lib/api';
import { getToken } from '../lib/api';
import type { HomepageSection, PageContent, PublicSiteData } from '../types';

interface CmsCtx {
  site: PublicSiteData | null;
  loading: boolean;
  refetch: () => Promise<void>;
  hero: Record<string, unknown> | null;
  featuredProductsSection: Record<string, unknown> | null;
  servicesSection: Record<string, unknown> | null;
  whyChooseUs: Record<string, unknown> | null;
  installation: Record<string, unknown> | null;
  howItWorks: Record<string, unknown> | null;
  testimonialsSection: Record<string, unknown> | null;
  gallerySection: Record<string, unknown> | null;
  faqSection: Record<string, unknown> | null;
  finalCta: Record<string, unknown> | null;
  pages: PageContent[];
  brand: Record<string, unknown>;
  contact: Record<string, unknown>;
  seo: Record<string, unknown>;
  appearance: Record<string, unknown>;
}

const Ctx = createContext<CmsCtx | null>(null);

function sectionMap(site: PublicSiteData | null) {
  const map: Record<string, Record<string, unknown> | null> = {};
  for (const s of site?.homepage ?? []) {
    map[s.slug] = s;
  }
  return map;
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<PublicSiteData | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const data = await apiGet<PublicSiteData>('/api/cms/public', false);
    setSite(data);
  }, []);

  useEffect(() => {
    refetch()
      .catch(() => setSite(null))
      .finally(() => setLoading(false));
  }, [refetch]);

  // Apply appearance theme as CSS variables + document title from SEO/branding
  useEffect(() => {
    if (!site) return;
    const appearance = site.settings.appearance ?? {};
    const root = document.documentElement;
    if (appearance.primary_color) root.style.setProperty('--primary', String(appearance.primary_color));
    if (appearance.secondary_color) root.style.setProperty('--primary-600', String(appearance.secondary_color));
    if (appearance.accent_color) root.style.setProperty('--accent', String(appearance.accent_color));
    if (appearance.background_color) {
      root.style.setProperty('--bg', String(appearance.background_color));
      document.body.style.background = String(appearance.background_color);
    }
    if (appearance.border_radius) root.style.setProperty('--radius', `${appearance.border_radius}px`);
    if (appearance.border_radius && typeof appearance.border_radius === 'number') {
      root.style.setProperty('--radius-lg', `${Number(appearance.border_radius) + 4}px`);
    }
    const branding = site.settings.branding ?? {};
    const title = String(branding.site_title ?? branding.company_name ?? 'AD Security Camera Solution');
    document.title = title;
  }, [site]);

  const brand = useMemo(() => site?.settings.branding ?? {}, [site]);
  const contact = useMemo(() => site?.settings.contact ?? {}, [site]);
  const seo = useMemo(() => site?.settings.seo ?? {}, [site]);
  const appearance = useMemo(() => site?.settings.appearance ?? {}, [site]);
  const pages = useMemo(() => (site?.pages as PageContent[] | undefined) ?? [], [site]);

  const { hero, featuredProductsSection, servicesSection, whyChooseUs, installation, howItWorks, testimonialsSection, gallerySection, faqSection, finalCta } = useMemo(() => {
    const m = sectionMap(site);
    return {
      hero: m['hero'] ?? null,
      featuredProductsSection: m['featured_products'] ?? null,
      servicesSection: m['services'] ?? null,
      whyChooseUs: m['why_choose_us'] ?? null,
      installation: m['installation'] ?? null,
      howItWorks: m['how_it_works'] ?? null,
      testimonialsSection: m['testimonials'] ?? null,
      gallerySection: m['gallery'] ?? null,
      faqSection: m['faq'] ?? null,
      finalCta: m['final_cta'] ?? null,
    };
  }, [site]);

  const value = useMemo<CmsCtx>(
    () => ({
      site,
      loading,
      refetch,
      hero,
      featuredProductsSection,
      servicesSection,
      whyChooseUs,
      installation,
      howItWorks,
      testimonialsSection,
      gallerySection,
      faqSection,
      finalCta,
      pages,
      brand,
      contact,
      seo,
      appearance,
    }),
    [
      site,
      loading,
      refetch,
      hero,
      featuredProductsSection,
      servicesSection,
      whyChooseUs,
      installation,
      howItWorks,
      testimonialsSection,
      gallerySection,
      faqSection,
      finalCta,
      pages,
      brand,
      contact,
      seo,
      appearance,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCms(): CmsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCms must be used within CmsProvider');
  return ctx;
}

export function loggedIn(): boolean {
  return Boolean(getToken());
}

export type { HomepageSection };