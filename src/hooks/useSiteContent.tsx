import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from './useQuery';
import {
  fetchAnnouncements,
  fetchFAQs,
  fetchFooterSections,
  fetchGallery,
  fetchHomepageSections,
  fetchNavigation,
  fetchServices,
  fetchSocialLinks,
  fetchTestimonials,
} from '../services/cms';
import type {
  Announcement,
  FAQ,
  FooterSection,
  GalleryItem,
  HomepageSection,
  NavItem,
  Service,
  SocialLink,
  Testimonial,
} from '../types';

interface SiteContent {
  services: Service[];
  servicesLoading: boolean;
  testimonials: Testimonial[];
  faqs: FAQ[];
  gallery: GalleryItem[];
  nav: NavItem[];
  social: SocialLink[];
  footer: FooterSection[];
  announcements: Announcement[];
  homepage: HomepageSection[];
  refreshKey: number;
  bust: () => void;
}

const SiteContentContext = createContext<SiteContent | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const services = useQuery(() => fetchServices(true), [refreshKey]);
  const testimonials = useQuery(() => fetchTestimonials(true), [refreshKey]);
  const faqs = useQuery(() => fetchFAQs(true), [refreshKey]);
  const gallery = useQuery(() => fetchGallery(true), [refreshKey]);
  const nav = useQuery(() => fetchNavigation(true), [refreshKey]);
  const social = useQuery(() => fetchSocialLinks(true), [refreshKey]);
  const footer = useQuery(() => fetchFooterSections(), [refreshKey]);
  const announcements = useQuery(() => fetchAnnouncements(true), [refreshKey]);
  const homepage = useQuery(() => fetchHomepageSections(), [refreshKey]);

  const value = useMemo<SiteContent>(
    () => ({
      services: services.data ?? [],
      servicesLoading: services.loading,
      testimonials: testimonials.data ?? [],
      faqs: faqs.data ?? [],
      gallery: gallery.data ?? [],
      nav: nav.data ?? [],
      social: social.data ?? [],
      footer: footer.data ?? [],
      announcements: announcements.data ?? [],
      homepage: homepage.data ?? [],
      refreshKey,
      bust: () => setRefreshKey((k) => k + 1),
    }),
    [services.data, services.loading, testimonials.data, faqs.data, gallery.data, nav.data, social.data, footer.data, announcements.data, homepage.data, refreshKey]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContent {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within SiteContentProvider');
  return ctx;
}

/** Get a single homepage section by key. */
export function useHomepageSection(key: string): HomepageSection | undefined {
  const { homepage } = useSiteContent();
  return homepage.find((s) => s.key === key);
}