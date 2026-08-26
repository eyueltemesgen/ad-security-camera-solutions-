import { Hero } from '../components/home/Hero';
import { Services } from '../components/home/Services';
import { Products } from '../components/home/Products';
import { About } from '../components/home/About';
import { Contact } from '../components/home/Contact';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/modals/AuthModal';
import { ServiceBookingModal } from '../components/modals/ServiceBookingModal';
import { ProductModal } from '../components/modals/ProductModal';
import { CartDrawer } from '../components/modals/CartDrawer';
import { CheckoutModal } from '../components/modals/CheckoutModal';

export function HomePage() {
  return (
    <div>
      <Hero />
      <Services />
      <Products />
      <About />
      <Contact />
      <Footer />

      <AuthModal />
      <ServiceBookingModal />
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
}
