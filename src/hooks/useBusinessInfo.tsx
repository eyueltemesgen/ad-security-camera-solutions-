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
}

const DEFAULTS: BusinessInfo = {
  companyName: 'AD Security Camera Solutions',
  phone: '+251 985 959 697',
  secondaryPhone: '+251 918 109 779',
  email: 'adcctvcamera16@gmail.com',
  website: 'www.adsecurity.com',
  address: 'Addis Ababa, Ethiopia',
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
