import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Moon, Phone, ShoppingCart, Sun, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useStorefront } from '../hooks/useStorefront';
import { useTheme } from '../hooks/useTheme';
import { toTel, useBusinessInfo } from '../hooks/useBusinessInfo';

const LINKS = [
  { href: '/#home', label: 'Home' },
  { href: '/#services', label: 'Services' },
  { href: '/#products', label: 'Products' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

/**
 * Storefront header. Mobile = compact bar with logo + tap-to-call.
 * No admin link/icon anywhere — /admin is reachable only by direct URL.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const { user } = useAuth();
  const { openCart, openAuth } = useStorefront();
  const { theme, toggleTheme } = useTheme();
  const info = useBusinessInfo();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAccount = () => {
    if (user) window.location.assign('/account');
    else openAuth();
  };

  // Header is part of the public storefront; it is not rendered inside the
  // isolated /admin app, but guard anyway so no admin affordance leaks in.
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 glass ${scrolled ? 'shadow-lg' : ''}`}
      style={{ borderBottom: '1px solid var(--border-soft)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <a href="/#home" className="flex items-center gap-2.5 group min-w-0">
            <div className="relative w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-brand-500/40 flex items-center justify-center bg-gradient-to-br from-brand-500/20 to-brand-700/20 transition-all group-hover:scale-105 flex-shrink-0">
              <Camera className="w-4 h-4 md:w-5 md:h-5 text-brand-400" />
            </div>
            <div className="min-w-0">
              <span className="text-base md:text-xl font-extrabold leading-none truncate block">
                <span className="text-gradient">AD</span> Security
              </span>
              <div className="text-[9px] md:text-[10px] tracking-wider -mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Camera Solutions
              </div>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-7 text-sm font-medium">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.label}
              </a>
            ))}

            <button onClick={openCart} className="relative p-1.5 rounded-lg hover:bg-brand-500/10 transition-colors" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>

            <button onClick={toggleTheme} aria-label="Toggle theme" className="p-1.5 rounded-lg hover:bg-brand-500/10 transition-colors">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-brand-400" />
              )}
            </button>

            <button onClick={handleAccount} aria-label="Account" className="p-1.5 rounded-lg hover:bg-brand-500/10 transition-colors">
              <User className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* Mobile actions: tap-to-call + cart + theme */}
          <div className="flex md:hidden items-center gap-1">
            <a
              href={`tel:${toTel(info.phone)}`}
              aria-label={`Call ${info.phone}`}
              className="w-11 h-11 flex items-center justify-center rounded-full text-white shadow-lg"
              style={{ background: 'linear-gradient(145deg, #3bb37f, #1f7f57)' }}
            >
              <Phone className="w-5 h-5" />
            </a>
            <button onClick={openCart} className="relative w-11 h-11 flex items-center justify-center rounded-full" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>
            <button onClick={toggleTheme} aria-label="Toggle theme" className="w-11 h-11 flex items-center justify-center rounded-full">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-brand-400" />
              )}
            </button>
            <Link to="/account" onClick={(e) => { if (!user) { e.preventDefault(); openAuth(); } }} aria-label="Account" className="w-11 h-11 flex items-center justify-center rounded-full">
              <User className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
