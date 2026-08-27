import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from '../types';

type ModalKind = 'auth' | 'cart' | 'checkout' | 'service' | 'product' | 'inquire' | null;

interface StorefrontContextValue {
  modal: ModalKind;
  selectedService: string;
  selectedProduct: Product | null;
  checkoutItems: CartItem[] | null;
  openAuth: () => void;
  openCart: () => void;
  openCheckout: (items?: CartItem[]) => void;
  openService: (serviceName: string) => void;
  openProduct: (product: Product) => void;
  openInquire: (product: Product) => void;
  closeModal: () => void;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [selectedService, setSelectedService] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[] | null>(null);

  const closeModal = useCallback(() => setModal(null), []);
  const openAuth = useCallback(() => setModal('auth'), []);
  const openCart = useCallback(() => setModal('cart'), []);
  const openCheckout = useCallback((items?: CartItem[]) => {
    setCheckoutItems(items ?? null);
    setModal('checkout');
  }, []);
  const openService = useCallback((serviceName: string) => {
    setSelectedService(serviceName);
    setModal('service');
  }, []);
  const openProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setModal('product');
  }, []);
  const openInquire = useCallback((product: Product) => {
    setSelectedProduct(product);
    setModal('inquire');
  }, []);

  const value = useMemo(
    () => ({
      modal,
      selectedService,
      selectedProduct,
      checkoutItems,
      openAuth,
      openCart,
      openCheckout,
      openService,
      openProduct,
      openInquire,
      closeModal,
    }),
    [modal, selectedService, selectedProduct, checkoutItems, openAuth, openCart, openCheckout, openService, openProduct, openInquire, closeModal]
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront(): StorefrontContextValue {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error('useStorefront must be used within StorefrontProvider');
  return ctx;
}
