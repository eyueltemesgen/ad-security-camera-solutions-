import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  addToWishlist,
  fetchWishlistIds,
  removeFromWishlist,
} from '../services/wishlist';

interface WishlistContextValue {
  ids: Set<string>;
  ready: boolean;
  toggle: (productId: string) => Promise<'needs-auth' | 'added' | 'removed'>;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setIds(new Set());
      setReady(false);
      return;
    }
    fetchWishlistIds(user.id)
      .then((set) => {
        setIds(set);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [user]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) return 'needs-auth';
      try {
        if (ids.has(productId)) {
          await removeFromWishlist(user.id, productId);
          setIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
          showToast('Removed from wishlist', 'warning');
          return 'removed';
        }
        await addToWishlist(user.id, productId);
        setIds((prev) => new Set(prev).add(productId));
        showToast('Added to wishlist', 'success');
        return 'added';
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Wishlist update failed', 'error');
        return 'removed';
      }
    },
    [user, ids, showToast]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      ready: Boolean(user) && ready,
      toggle,
      isWishlisted: (productId: string) => ids.has(productId),
    }),
    [ids, ready, user, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
