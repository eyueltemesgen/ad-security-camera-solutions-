import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Menu, ShoppingCart, User, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useStorefront } from '../hooks/useStorefront';

const LINKS = [
  { href: '/#home', label: 'Home' },
  { href: '/#services', label: 'Services' },
  { href: '/#products', label: 'Products' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAdmin } = useAuth();
  const { openCart, openAuth } = useStorefront();
  const navigate = useNavigate();

  const handleAccount = () => {
    setMobileOpen(false);
    if (user) navigate('/account');
    else openAuth();
  };

  return (
    <nav className="glass border-b border-white/5 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <a href="/#home" className="flex items-center group">
          <div className="w-11 h-11 rounded-full border-2 border-brand-500/40 shadow-glow flex items-center justify-center bg-gradient-to-br from-brand-500/20 to-brand-700/20 transition-all group-hover:scale-105">
            <Camera className="w-5 h-5 text-brand-400" />
          </div>
          <div className="ml-3">
            <span className="text-xl font-extrabold text-white leading-none">
              <span className="text-gradient">AD</span> Security
            </span>
            <div className="text-[10px] text-gray-400 tracking-wider -mt-0.5">
              Camera Solutions
            </div>
          </div>
        </a>

        <div className="hidden md:flex items-center space-x-7 text-sm font-medium">
          {LINKS.map((link) => (
            <a key={link.label} href={link.href} className="nav-link text-gray-300 hover:text-white">
              {link.label}
            </a>
          ))}
          {isAdmin && (
            <Link to="/admin" className="nav-link text-brand-300 hover:text-white">
              Admin
            </Link>
          )}
          <button onClick={openCart} className="relative" aria-label="Cart">
            <ShoppingCart className="w-5 h-5 text-gray-300 hover:text-white transition" />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>
          <button onClick={handleAccount} aria-label="Account">
            <User className="w-5 h-5 text-gray-300 hover:text-white transition" />
          </button>
        </div>

        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="md:hidden text-white"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/5 py-4 px-2 flex flex-col space-y-1 text-sm">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="text-brand-300 px-3 py-2 rounded-lg hover:bg-white/5"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleAccount}
            className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 text-left flex items-center gap-2"
          >
            <User className="w-4 h-4" /> My Account
          </button>
        </div>
      )}
    </nav>
  );
}
