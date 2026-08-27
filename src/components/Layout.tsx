import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { AuthModal } from './modals/AuthModal';
import { ServiceBookingModal } from './modals/ServiceBookingModal';
import { ProductModal } from './modals/ProductModal';
import { OrderInquireSheet } from './modals/OrderInquireSheet';
import { CartDrawer } from './modals/CartDrawer';
import { CheckoutModal } from './modals/CheckoutModal';

/**
 * Shared public storefront layout. All customer-facing pages render inside
 * this shell so the announcement bar, header, footer and modals are consistent.
 */
export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>
      <Footer />
      <BottomNav />

      <AuthModal />
      <ServiceBookingModal />
      <ProductModal />
      <OrderInquireSheet />
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
}