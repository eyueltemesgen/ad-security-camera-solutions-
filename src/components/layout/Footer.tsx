import { Link } from 'react-router-dom';
import { useCms } from '../../hooks/useCms';

const SOCIAL_ICONS: Record<string, string> = {
  instagram: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7 .1 5.7.2 4.8.4 4 .7c-.9.3-1.6.8-2.3 1.5C1 2.9.5 3.6.2 4.5.1 5.3-.1 6.2-.1 7.5-.1 8.8 0 9.2 0 12.5s0 3.7.1 5c.1 1.3.3 2.2.6 3 .3.9.8 1.6 1.5 2.3.7.7 1.4 1.2 2.3 1.5.8.3 1.7.5 3 .6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.2-.3 3-.6.9-.3 1.6-.8 2.3-1.5.7-.7 1.2-1.4 1.5-2.3.3-.8.5-1.7.6-3 .1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.2-.6-3-.3-.9-.8-1.6-1.5-2.3C21.1 1 20.4.5 19.5.2 18.7-.1 17.8-.3 16.5-.3 15.2-.4 14.8-.4 12-.4zm0 5.7c-3.5 0-6.3 2.8-6.3 6.3s2.8 6.3 6.3 6.3 6.3-2.8 6.3-6.3S15.5 5.7 12 5.7zm0 10.4c-2.3 0-4.1-1.9-4.1-4.1s1.9-4.1 4.1-4.1 4.1 1.9 4.1 4.1-1.9 4.1-4.1 4.1zm6.6-10.7c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5 1.5.7 1.5 1.5z',
  telegram: 'M21.9 4.3c.2-.9-.7-1.6-1.5-1.3L2.4 9.4c-1 .3-1 1.7 0 2l4.7 1.3 1.8 5.7c.3.9 1.4 1.1 2 .4l2.6-2.7 4.9 3.7c.8.6 2 .2 2.2-.9l1.3-14.6zm-12 8.1l9-5.6c.3-.2.6.3.3.4l-7.3 6.7c-.3.3-.5.7-.5 1.2l-.3 2-1.5-4.7c-.2-.6-.2-1.2.3-1z',
  tiktok: 'M19.6 6.7c-2.1 0-3.7-1.1-4.3-2.8h-3.1v11.9c0 1.9-1.5 3.4-3.4 3.4-1.1 0-2-.5-2.6-1.3-.7-.9-1-2-1-3.2 0-1.9 1.5-3.4 3.4-3.4.5 0 .9.1 1.3.3V9.5c-.4-.1-.9-.1-1.3-.1-3.6 0-6.5 2.9-6.5 6.5 0 1.8.7 3.5 1.9 4.8 1.3 1.3 3.1 2.1 4.9 2.1 3.6 0 6.5-2.9 6.5-6.5V8.7c1.2.9 2.7 1.4 4.3 1.4V6.7z',
  facebook: 'M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1C0 18.1 4.4 23.1 10.1 24v-8.4H7.1v-3.5h3v-2.7c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.3l-.5 3.5h-2.8V24C19.6 23.1 24 18.1 24 12.1z',
  youtube: 'M23.5 6.2c-.3-1-1-1.8-2-2-1.8-.5-8-.5-8-.5s-6.2 0-8 .5c-.9.2-1.7 1-2 2-.5 1.8-.5 5.8-.5 5.8s0 4 .5 5.8c.3 1 1 1.8 2 2 1.8.5 8 .5 8 .5s6.2 0 8-.5c-.9-.2 1.7-1 2-2 .5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.6 15V9l5.6 3-5.6 3z',
  whatsapp: 'M17.5 14.4c-.3-.1-1.7-.8-1.9-.9s-.4-.1-.6.1-.7.9-.9 1.1c-.1.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6c.1-.1.3-.4.4-.5.2-.2.2-.3.3-.5s0-.4 0-.5-.2-.4-.2-.9c-.2-.3-.9-2.1-1.2-2.9-.3-.8-.6-.7-.9-.7h-.7c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 3 1.2 3.5 1.4 3.7c.2.2 2.5 3.8 6.1 5.3.9.4 1.5.6 2 .8.9.3 1.7.2 2.3.1.7-.1 1.7-.7 2-1.4.3-.7.3-1.2.2-1.3 0-.2-.3-.3-.6-.4zM12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12S18.6 0 12 0zm0 22.5c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-3.6.9.9-3.5-.3-.4C2.2 16.2 1.5 14.1 1.5 12 1.5 6.2 6.2 1.5 12 1.5S22.5 6.2 22.5 12 17.8 22.5 12 22.5z',
  linkedin: 'M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4c-1.2 0-2.1-1-2.1-2.1s.9-2.1 2.1-2.1 2.1.9 2.1 2.1-1 2.1-2.1 2.1zM7.1 20.4H3.5V9h3.6v11.4zM22.2 0H1.8C.8 0 0 .8 0 1.8v20.4c0 1 .8 1.8 1.8 1.8h20.4c1 0 1.8-.8 1.8-1.8V1.8c0-1-.8-1.8-1.8-1.8z',
};

export default function Footer() {
  const { site, brand, contact } = useCms();

  const footerSections = site?.footer ?? [];
  const social = site?.social ?? [];
  const companyName = String(brand.company_name ?? 'AD Security Camera Solution');
  const logoUrl = String(brand.logo_url ?? '');
  const description = String(brand.company_description ?? 'Professional security and technology solutions — CCTV systems, access control, networking, time attendance and IT services.');
  const email = String(contact.email ?? 'adsecuritycamerasolution@gmail.com');
  const phone = String(contact.phone ?? '');
  const address = String(contact.address ?? '');
  const workingHours = String(contact.working_hours ?? '');
  const copyright = String(site?.settings.branding?.copyright_text ?? `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`);

  return (
    <footer className="bg-[var(--primary-700)] text-slate-300">
      <div className="container-x py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            {logoUrl ? (
              <img src={logoUrl} alt={`${companyName} logo`} className="h-12 w-12 rounded-md object-contain bg-white/5" />
            ) : (
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent)] text-lg font-black text-slate-900">
                AD
              </span>
            )}
            <span className="mt-3 block text-base font-bold text-white">{companyName}</span>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
            <div className="mt-4 flex gap-2">
              {social
                .filter((s) => s.url)
                .map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition-colors hover:bg-[var(--accent)] hover:text-slate-900"
                    aria-label={s.platform}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d={SOCIAL_ICONS[s.icon?.toLowerCase()] ?? ''} />
                    </svg>
                  </a>
                ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link to={link.url} className="text-sm text-slate-400 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {email && (
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <a href={`mailto:${email}`} className="break-all hover:text-white">{email || '—'}</a>
                </li>
              )}
              {phone && (
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.6 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <a href={`tel:${phone}`} className="hover:text-white">{phone}</a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span>{address}</span>
                </li>
              )}
              {workingHours && (
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span>{workingHours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-4 text-xs text-slate-500 sm:flex-row">
          <span>{copyright}</span>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/products" className="hover:text-white">Products</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/faq" className="hover:text-white">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}