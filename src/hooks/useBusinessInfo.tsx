import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from './useQuery';
import { fetchSiteSettings } from '../services/misc';
import type { SiteSettings } from '../types';

export interface BusinessInfo {
  companyName: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  website: string;
  address: string;
  currency: string;
  logoUrl: string;
  faviconUrl: string;
  tagline: string;
  description: string;
  workingHours: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
  tiktok: string;
  telegram: string;
  instagram: string;
  linkedin: string;
  primaryColor: string;
  accentColor: string;
  seoTitle: string;
  seoDescription: string;
  footerText: string;
}

export const DEFAULTS: BusinessInfo = {
  companyName: 'AD Security Camera Solutions',
  phone: '+251 985 959 697',
  secondaryPhone: '+251 918 109 779',
  email: 'adsecuritycamerasolution@gmail.com',
  website: 'www.adsecurity.com',
  address: 'Addis Ababa, Ethiopia',
  currency: 'ETB',
  logoUrl: '',
  faviconUrl: '',
  tagline: 'Professional Security & Technology Solutions',
  description: 'Professional security and technology company - CCTV, networking, access control, time attendance, video intercom and IT solutions.',
  workingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
  facebook: '',
  youtube: '',
  whatsapp: '',
  tiktok: 'https://tiktok.com/@adsecuritycamera',
  telegram: 'https://t.me/adsecuritycamera',
  instagram: 'https://instagram.com/adsecuritycamera',
  linkedin: '',
  primaryColor: '#1b4d2e',
  accentColor: '#55c997',
  seoTitle: 'AD Security Camera Solutions - Security Systems & Professional Installation',
  seoDescription: 'Professional security and technology company in Ethiopia. CCTV, access control, time attendance, video intercom and networking solutions with professional installation.',
  footerText: 'Professional security and technology solutions trusted by clients across Ethiopia.',
};

const BusinessInfoContext = createContext<BusinessInfo>(DEFAULTS);

export function BusinessInfoProvider({ children }: { children: ReactNode }) {
  const settings = useQuery(() => fetchSiteSettings(), []);

  const value = useMemo<BusinessInfo>(() => {
    const s = settings.data as SiteSettings | null;
    if (!s) return DEFAULTS;
    return {
      companyName: s.company_name || DEFAULTS.companyName,
      phone: s.phone || DEFAULTS.phone,
      secondaryPhone: s.secondary_phone || DEFAULTS.secondaryPhone,
      email: s.email || DEFAULTS.email,
      website: s.website || DEFAULTS.website,
      address: s.address || DEFAULTS.address,
      currency: s.currency || DEFAULTS.currency,
      logoUrl: s.logo_url || '',
      faviconUrl: s.favicon_url || '',
      tagline: s.tagline || DEFAULTS.tagline,
      description: s.description || DEFAULTS.description,
      workingHours: s.working_hours || DEFAULTS.workingHours,
      facebook: s.facebook || '',
      youtube: s.youtube || '',
      whatsapp: s.whatsapp || '',
      tiktok: s.tiktok || DEFAULTS.tiktok,
      telegram: s.telegram || DEFAULTS.telegram,
      instagram: s.instagram || DEFAULTS.instagram,
      linkedin: s.linkedin || '',
      primaryColor: s.primary_color || DEFAULTS.primaryColor,
      accentColor: s.accent_color || DEFAULTS.accentColor,
      seoTitle: s.seo_title || DEFAULTS.seoTitle,
      seoDescription: s.seo_description || DEFAULTS.seoDescription,
      footerText: s.footer_text || DEFAULTS.footerText,
    };
  }, [settings.data]);

  return <BusinessInfoContext.Provider value={value}>{children}</BusinessInfoContext.Provider>;
}

export function useBusinessInfo(): BusinessInfo {
  return useContext(BusinessInfoContext);
}

/** Turn "+251 985 959 697" into "+251985959697" for tel: links. */
export function toTel(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}
