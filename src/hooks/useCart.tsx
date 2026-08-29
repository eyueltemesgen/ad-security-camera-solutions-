import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api';
import type { CartLine } from '../types';
import { useAuth } from './useAuth';

interface CartCtx {
  items: CartLine[];
  loading: boolean;
  count: number;
  subtotal: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiGet<{ cart_id: string; items: CartLine[] }>('/api/cart');
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh().catch(() => setItems([]));
  }, [refresh]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      await apiPost('/api/cart/items', { product_id: productId, quantity });
      await refresh();
    },
    [refresh],
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      await apiPatch(`/api/cart/items/${cartItemId}`, { quantity });
      await refresh();
    },
    [refresh],
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      await apiDelete(`/api/cart/items/${cartItemId}`);
      await refresh();
    },
    [refresh],
  );

  const clear = useCallback(async () => {
    await apiDelete('/api/cart');
    setItems([]);
  }, []);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((n, i) => n + i.quantity * (i.sale_price ?? i.price), 0);
    return { items, loading, count, subtotal, addItem, updateQuantity, removeItem, clear, refresh };
  }, [items, loading, addItem, updateQuantity, removeItem, clear, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}