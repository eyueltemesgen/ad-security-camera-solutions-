import { Camera, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { toTel, useBusinessInfo } from '../hooks/useBusinessInfo';

const QUICK_LINKS = [
  { href: '/#home', label: 'Home' },
  { href: '/#services', label: 'Services' },
  { href: '/#products', label: 'Products' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

const SERVICE_LINKS = ['CCTV Systems', 'Network Solutions', 'Time Attendance', 'Video Intercom', 'Web & IT'];

/** Footer with tap-to-call, email anchor, map address metadata. No admin link. */
export function Footer() {
  const info = useBusinessInfo();

  return (
    <footer className="border-t pb-20 md:pb-0" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-panel)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-brand-500/40 flex items-center justify-center bg-gradient-to-br from-brand-500/20 to-brand-700/20">
                <Camera className="w-5 h-5 text-brand-400" />
              </div>
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
              Professional security and IT solutions trusted by clients across Ethiopia.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="font-semibold mb-3 text-sm">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-brand-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h5 className="font-semibold mb-3 text-sm">Services</h5>
            <ul className="space-y-2 text-sm">
              {SERVICE_LINKS.map((s) => (
                <li key={s} style={{ color: 'var(--text-secondary)' }}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Contact — tap-to-call + email + address */}
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
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(info.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-brand-400 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
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
