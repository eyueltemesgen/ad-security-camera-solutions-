import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { StorefrontProvider } from './hooks/useStorefront';
import { ToastProvider } from './hooks/useToast';
import { WishlistProvider } from './hooks/useWishlist';
import { ThemeProvider } from './hooks/useTheme';
import { BusinessInfoProvider } from './hooks/useBusinessInfo';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <StorefrontProvider>
                <BusinessInfoProvider>
                  <App />
                </BusinessInfoProvider>
              </StorefrontProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
