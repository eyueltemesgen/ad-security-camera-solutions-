import { Hero } from '../components/home/Hero';
import { Services } from '../components/home/Services';
import { Products } from '../components/home/Products';
import { About } from '../components/home/About';
import { Testimonials } from '../components/home/Testimonials';
import { GalleryStrip } from '../components/home/GalleryStrip';
import { FaqStrip } from '../components/home/FaqStrip';
import { Contact } from '../components/home/Contact';

/**
 * Storefront landing page. Rendered inside the shared Layout (announcement bar,
 * header, footer, bottom nav and modals are provided by the shell).
 */
export function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <Products />
      <GalleryStrip />
      <About />
      <Testimonials />
      <FaqStrip />
      <Contact />
    </main>
  );
}
