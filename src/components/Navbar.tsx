import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Menu, Moon, ShoppingCart, Sun, User, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useStorefront } from '../hooks/useStorefront';
import { useTheme } from '../hooks/useTheme';

const LINKS = [
  { href: '/#home', label: 'Home' },
  { href: '/#services', label: 'Services' },
  { href: '/#products', label: 'Products' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const { user, isAdmin } = useAuth();
  const { openCart, openAuth } = useStorefront();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (typeof window !== 'undefined') {
    window.onscroll = () => setScrolled(window.scrollY > 20);
  }

  const handleAccount = () => {
    setMobileOpen(false);
    if (user) navigate('/account');
    else openAuth();
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg' : 'glass border-b'
      }`}
      style={{ borderColor: 'var(--border-soft)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/#home" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-full border-2 border-brand-500/40 flex items-center justify-center bg-gradient-to-br from-brand-500/20 to-brand-700/20 transition-all group-hover:scale-105 group-hover:border-brand-500/60">
              <Camera className="w-5 h-5 text-brand-400" />
              <div className="absolute inset-0 rounded-full border-2 border-brand-500/0 group-hover:border-brand-500/20 animate-pulse-ring" />
            </div>
            <div>
              <span className="text-xl font-extrabold leading-none">
                <span className="text-gradient">AD</span> Security
              </span>
              <div className="text-[10px] tracking-wider -mt-0.5" style={{ color: 'var(--text-muted)' }}>
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
            {isAdmin && (
              <Link to="/admin" className="nav-link text-brand-400 hover:text-brand-300 transition-colors">
                Admin
              </Link>
            )}

            {/* Cart */}
            <button onClick={openCart} className="relative p-1.5 rounded-lg hover:bg-brand-500/10 transition-colors" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-lg hover:bg-brand-500/10 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-brand-400" />
              )}
            </button>

            {/* Account */}
            <button
              onClick={handleAccount}
              aria-label="Account"
              className="p-1.5 rounded-lg hover:bg-brand-500/10 transition-colors"
            >
              <User className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="md:hidden p-2 rounded-lg hover:bg-brand-500/10 transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t py-4 px-4 flex flex-col space-y-1 text-sm" style={{ borderColor: 'var(--border-soft)' }}>
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-brand-500/10 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {link.label}
            </a>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="text-brand-400 px-3 py-2.5 rounded-xl hover:bg-brand-500/10 transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              onClick={handleAccount}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl hover:bg-brand-500/10 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <User className="w-4 h-4" /> My Account
            </button>
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl hover:bg-brand-500/10 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
