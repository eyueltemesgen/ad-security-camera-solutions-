import { Camera, Facebook, Instagram, Music2, Send } from 'lucide-react';

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
    <footer className="bg-deep border-t border-white/5 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h5 className="font-semibold text-white mb-3">Quick Links</h5>
          <div className="space-y-2 text-gray-400">
            {QUICK.map((link) => (
              <a key={link.label} href={link.href} className="block hover:text-white transition">
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h5 className="font-semibold text-white mb-3">Services</h5>
          <div className="space-y-2 text-gray-400">
            {SERVICES_LIST.map((service) => (
              <a key={service} href="#services" className="block hover:text-white transition">
                {service}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h5 className="font-semibold text-white mb-3">Products</h5>
          <div className="space-y-2 text-gray-400">
            <a href="#products" className="block hover:text-white transition">Cameras</a>
            <a href="#products" className="block hover:text-white transition">Attendance Devices</a>
            <a href="#products" className="block hover:text-white transition">Intercom Systems</a>
            <a href="#products" className="block hover:text-white transition">Network Equipment</a>
          </div>
        </div>
        <div>
          <h5 className="font-semibold text-white mb-3">Follow Us</h5>
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                title={social.label}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white transition-transform hover:scale-110"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 text-center text-gray-500 text-xs">
        <p className="flex items-center justify-center gap-2">
          <Camera className="w-3.5 h-3.5 text-brand-400" />
          &copy; 2026 AD Security Camera Solutions. All Rights Reserved. | +251 985 959 697 |
          +251 918 109 779
        </p>
      </div>
    </footer>
  );
}
