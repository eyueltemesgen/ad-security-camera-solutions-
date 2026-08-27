import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Home, Phone, ShoppingBag, Wrench } from 'lucide-react';

const ITEMS = [
  { href: '/#home', label: 'Home', icon: Home },
  { href: '/#products', label: 'Products', icon: ShoppingBag },
  { href: '/#services', label: 'Services', icon: Wrench },
  { href: '/#contact', label: 'Quote', icon: FileText },
  { href: '/#contact', label: 'Contact', icon: Phone },
];

/** Mobile-only bottom navigation. Hidden on /admin. No admin link anywhere. */
export function BottomNav() {
  const location = useLocation();
  const [active, setActive] = useState('home');

  // Track which section is in view so the active tab follows scroll.
  useEffect(() => {
    const ids = ['home', 'products', 'services', 'contact'];
    const onScroll = () => {
      let current = 'home';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t"
      style={{
        background: 'var(--nav-bg)',
        borderColor: 'var(--border-soft)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      aria-label="Primary"
    >
      <div className="grid grid-cols-5 max-w-lg mx-auto">
        {ITEMS.map((item) => {
          const target = item.href.split('#')[1];
          const isActive = active === target;
          return (
            <a
              key={item.label}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-1 min-h-[56px] py-1.5 transition-colors"
              style={{ color: isActive ? 'var(--brand-accent, #55c997)' : 'var(--text-muted)' }}
            >
              <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
