import { Camera, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { toTel, useBusinessInfo } from '../hooks/useBusinessInfo';
import { useSiteContent } from '../hooks/useSiteContent';

const SOCIAL_ICONS: Record<string, string> = {
  instagram: 'Instagram',
  send: 'Telegram',
  music: 'TikTok',
  facebook: 'Facebook',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
};

export function Footer() {
  const info = useBusinessInfo();
  const { footer, social } = useSiteContent();

  return (
    <footer className="border-t pb-20 md:pb-0" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              {info.logoUrl ? (
                <img src={info.logoUrl} alt={info.companyName} className="w-10 h-10 object-contain rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-brand-500/40 flex items-center justify-center bg-gradient-to-br from-brand-500/20 to-brand-700/20">
                  <Camera className="w-5 h-5 text-brand-400" />
                </div>
              )}
              <div>
                <span className="text-base font-extrabold leading-none">
                  <span className="text-gradient">AD</span> Security
                </span>
                <div className="text-[9px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Camera Solutions
                </div>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {info.footerText || info.description}
            </p>
            {social.length > 0 && (
              <div className="flex gap-3 mt-4">
                {social.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    title={`${s.platform} — ${s.username}`}
                    className="w-9 h-9 rounded-full flex items-center justify-center border text-sm font-semibold hover:bg-brand-500/10 transition-colors"
                    style={{ borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }}
                  >
                    {(SOCIAL_ICONS[s.icon] ?? s.platform).slice(0, 1)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer CMS columns */}
          {footer.map((col) => (
            <div key={col.id}>
              <h5 className="font-semibold mb-3 text-sm">{col.title}</h5>
              <ul className="space-y-2 text-sm">
                {(col.links ?? []).map((link, i) => (
                  <li key={i}>
                    <a href={link.url} className="hover:text-brand-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h5 className="font-semibold mb-3 text-sm">Contact</h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={`tel:${toTel(info.phone)}`} className="flex items-center gap-2 hover:text-brand-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  <Phone className="w-4 h-4 text-brand-400" /> {info.phone}
                </a>
              </li>
              <li>
                <a href={`tel:${toTel(info.secondaryPhone)}`} className="flex items-center gap-2 hover:text-brand-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  <Phone className="w-4 h-4 text-brand-400" /> {info.secondaryPhone}
                </a>
              </li>
              <li>
                <a href={`mailto:${info.email}`} className="flex items-center gap-2 hover:text-brand-400 transition-colors break-all" style={{ color: 'var(--text-secondary)' }}>
                  <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" /> {info.email}
                </a>
              </li>
              <li>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(info.address)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin className="w-4 h-4 text-brand-400" /> {info.address}
                </a>
              </li>
              <li className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Globe className="w-4 h-4 text-brand-400" /> {info.website}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-xs" style={{ borderColor: 'var(--border-soft)', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} {info.companyName}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}