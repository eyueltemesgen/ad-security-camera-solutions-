import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Menu, Moon, Phone, Search, ShoppingCart, Sun, User, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useStorefront } from '../hooks/useStorefront';
import { useTheme } from '../hooks/useTheme';
import { toTel, useBusinessInfo } from '../hooks/useBusinessInfo';
import { useSiteContent } from '../hooks/useSiteContent';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, profile } = useAuth();
  const { openCart, openAuth } = useStorefront();
  const { theme, toggleTheme } = useTheme();
  const info = useBusinessInfo();
  const { nav } = useSiteContent();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (location.pathname.startsWith('/admin')) return null;

  const links =
    nav.length > 0
      ? nav.map((n) => ({ title: n.title, url: n.url, id: n.id }))
      : [
          { title: 'Home', url: '/', id: 'd1' },
          { title: 'Products', url: '/products', id: 'd2' },
          { title: 'Services', url: '/services', id: 'd3' },
          { title: 'About', url: '/about', id: 'd4' },
          { title: 'Gallery', url: '/gallery', id: 'd5' },
          { title: 'Contact', url: '/contact', id: 'd6' },
        ];

  const handleAccount = () => {
    if (user) navigate('/account');
    else openAuth();
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const el = document.getElementById('header-search') as HTMLInputElement | null;
    navigate(`/products?q=${encodeURIComponent(el?.value ?? '')}`);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 glass ${scrolled ? 'shadow-lg' : ''}`}
      style={{ borderBottom: '1px solid var(--border-soft)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16 gap-2">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 -ml-2 rounded-lg"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            )}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group min-w-0">
            {info.logoUrl ? (
              <img src={info.logoUrl} alt={info.companyName} className="w-9 h-9 md:w-11 md:h-11 object-contain rounded-full flex-shrink-0" />
            ) : (
              <div className="relative w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-brand-500/40 flex items-center justify-center bg-gradient-to-br from-brand-500/20 to-brand-700/20 transition-all group-hover:scale-105 flex-shrink-0">
                <Camera className="w-4 h-4 md:w-5 md:h-5 text-brand-400" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-base md:text-lg font-extrabold leading-none truncate block">
                <span className="text-gradient">AD</span> Security
              </span>
              <div className="text-[9px] md:text-[10px] tracking-wider -mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Camera Solutions
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                className="nav-link transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.title}
              </a>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1 md:gap-2 ml-auto">
            <form onSubmit={handleSubmit} className="hidden md:flex items-center w-40 xl:w-56">
              <Search className="w-4 h-4 absolute ml-3" style={{ color: 'var(--text-muted)' }} />
              <input
                type="search"
                placeholder="Search products…"
                id="header-search"
                className="form-input !pl-9 !h-9"
              />
            </form>

            <Link to="/products" className="md:hidden p-1.5 rounded-lg" aria-label="Search" style={{ color: 'var(--text-secondary)' }}>
              <Search className="w-5 h-5" />
            </Link>

            <button onClick={toggleTheme} aria-label="Toggle theme" className="p-1.5 rounded-lg hover:bg-brand-500/10 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-brand-400" />}
            </button>

            <button onClick={openCart} className="relative p-1.5 rounded-lg hover:bg-brand-500/10 transition-colors" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>

            <button onClick={handleAccount} aria-label="Account" className="p-1.5 rounded-lg hover:bg-brand-500/10 transition-colors">
              {user && profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <User className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>

            <Link
              to="/services"
              className="hidden xl:inline-flex h-9 px-4 rounded-full text-white text-sm font-semibold items-center gap-1.5"
              style={{ background: 'linear-gradient(145deg, #f97316, #ea580c)' }}
            >
              Request a Service
            </Link>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden pb-4 space-y-1 border-t" style={{ borderColor: 'var(--border-soft)' }}>
            {links.map((link) => (
              <a key={link.id} href={link.url} className="block px-3 py-2.5 rounded-lg text-base font-medium hover:bg-brand-500/5" style={{ color: 'var(--text-primary)' }}>
                {link.title}
              </a>
            ))}
            <Link to="/services" className="block px-3 py-2.5 rounded-lg text-base font-semibold text-white" style={{ background: 'linear-gradient(145deg, #f97316, #ea580c)' }}>
              Request a Service
            </Link>
            <a href={`tel:${toTel(info.phone)}`} className="block px-3 py-2.5 rounded-lg text-base font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Phone className="w-4 h-4 text-brand-400" /> {info.phone}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}