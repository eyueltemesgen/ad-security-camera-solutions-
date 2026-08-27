import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { DatabaseZap } from 'lucide-react';
import { isSupabaseConfigured } from './lib/supabase';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AccountPage } from './pages/AccountPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { RequestServicePage } from './pages/RequestServicePage';

// Admin is code-split to keep the storefront light. Reachable only via /admin.
const AdminApp = lazy(() => import('./pages/admin/AdminApp').then((m) => ({ default: m.AdminApp })));

export function App() {
  if (!isSupabaseConfigured) {
    return <SetupNotice />;
  }
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading admin…</p>
              </div>
            }
          >
            <AdminApp />
          </Suspense>
        }
      />

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/request-service" element={<RequestServicePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}

function PageNotFound() {
  const location = useLocation();
  void location;
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-2">404</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">This page doesn't exist.</p>
        <a href="/" className="btn-primary px-8 py-2.5">
          Go Home
        </a>
      </div>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-night">
      <div className="glass-card rounded-2xl p-8 max-w-lg text-center">
        <DatabaseZap className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-3">Supabase setup required</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This app needs a Supabase project. Set the environment variables and restart the dev server:
        </p>
        <ol className="text-left text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-4">
          <li>1. Create a project at <span className="text-brand-500 dark:text-blue-400">supabase.com</span></li>
          <li>2. Run the SQL in <code className="text-brand-300 dark:text-blue-300">supabase/migrations/</code> (or use the Supabase CLI)</li>
          <li>3. Copy <code className="text-brand-300 dark:text-blue-300">.env.example</code> to <code className="text-brand-300 dark:text-blue-300">.env</code> and fill in your Project URL + anon key</li>
          <li>4. Restart the dev server</li>
        </ol>
        <p className="text-xs text-gray-500">
          See <code className="text-brand-300 dark:text-blue-300">README.md</code> for the full setup guide.
        </p>
      </div>
    </div>
  );
}
