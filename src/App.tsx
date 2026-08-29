import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { CmsProvider } from './hooks/useCms';
import { ToastProvider } from './hooks/useToast';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import AboutPage from './pages/AboutPage';
import GalleryPage from './pages/GalleryPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import RequestServicePage from './pages/RequestServicePage';
import RequestServiceSuccessPage from './pages/RequestServiceSuccessPage';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import CustomerLayout from './pages/customer/CustomerLayout';
import DashboardOverview from './pages/customer/DashboardOverview';
import { MyOrdersPage, OrderDetailPage } from './pages/customer/OrdersPages';
import { MyServiceRequestsPage, ServiceRequestDetailPage } from './pages/customer/ServiceRequestPages';
import NotificationsPage from './pages/customer/NotificationsPage';
import ProfilePage from './pages/customer/ProfilePage';

import AdminApp from './pages/admin/AdminApp';
import { NotFoundPage } from './pages/ErrorPages';

function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}

function PublicLayout() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdminArea && <Header />}
      <main>{isAdminArea ? (
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/request-service" element={<RequestServicePage />} />
          <Route path="/request-service/success" element={<RequestServiceSuccessPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/dashboard" element={<CustomerLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="orders" element={<MyOrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="services" element={<MyServiceRequestsPage />} />
            <Route path="services/:id" element={<ServiceRequestDetailPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}</main>
      {!isAdminArea && <Footer />}
    </>
  );
}

function AppShell() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        <span className="text-sm text-slate-400">Loading…</span>
      </div>
    );
  }
  return <PublicLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <CmsProvider>
            <CartProvider>
              <AppShell />
            </CartProvider>
          </CmsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export { Link };