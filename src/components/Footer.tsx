import { Camera, Facebook, Instagram, Mail, MapPin, Music2, Phone, Send } from 'lucide-react';

const QUICK = [
  { href: '#home', label: 'Home' },
  { href: '#services', label: 'Services' },
  { href: '#products', label: 'Products' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

const SERVICES_LIST = [
  'CCTV Systems',
  'Network Solutions',
  'Time Attendance',
  'Video Intercom',
  'Web & IT',
];

const SOCIALS = [
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com/adsecuritycamera' },
  { label: 'Telegram', icon: Send, href: 'https://t.me/adsecuritycamera' },
  { label: 'TikTok', icon: Music2, href: 'https://tiktok.com/@adsecuritycamera' },
  { label: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
];

export function Footer() {
  return (
    <footer className="bg-deep border-t px-4 sm:px-6 lg:px-8 py-14 relative overflow-hidden" style={{ borderColor: 'var(--border-soft)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Brand row */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full border-2 border-brand-500/40 flex items-center justify-center bg-gradient-to-br from-brand-500/20 to-brand-700/20">
              <Camera className="w-6 h-6 text-brand-400" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-extrabold leading-none">
                <span className="text-gradient">AD</span> Security
              </span>
              <div className="text-[10px] tracking-wider -mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Camera Solutions
              </div>
            </div>
          </div>
          <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
            Professional security and IT solutions trusted by 1200+ clients across Ethiopia.
          </p>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm mb-10">
          <div>
            <h5 className="font-semibold mb-3">Quick Links</h5>
            <div className="space-y-2.5" style={{ color: 'var(--text-secondary)' }}>
              {QUICK.map((link) => (
                <a key={link.label} href={link.href} className="block hover:text-brand-400 transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Services</h5>
            <div className="space-y-2.5" style={{ color: 'var(--text-secondary)' }}>
              {SERVICES_LIST.map((service) => (
                <a key={service} href="#services" className="block hover:text-brand-400 transition-colors">
                  {service}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Products</h5>
            <div className="space-y-2.5" style={{ color: 'var(--text-secondary)' }}>
              <a href="#products" className="block hover:text-brand-400 transition-colors">Cameras</a>
              <a href="#products" className="block hover:text-brand-400 transition-colors">Attendance Devices</a>
              <a href="#products" className="block hover:text-brand-400 transition-colors">Intercom Systems</a>
              <a href="#products" className="block hover:text-brand-400 transition-colors">Network Equipment</a>
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Follow Us</h5>
            <div className="flex gap-2.5 mb-4">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  title={social.label}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-brand-500/30"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> +251 985 959 697</p>
              <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> +251 918 109 779</p>
              <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> adcctvcamera16@gmail.com</p>
              <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Addis Ababa, Ethiopia</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t text-center text-xs" style={{ borderColor: 'var(--border-soft)', color: 'var(--text-muted)' }}>
          <p className="flex items-center justify-center gap-2">
            <Camera className="w-3.5 h-3.5 text-brand-400" />
            &copy; 2026 AD Security Camera Solutions. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
