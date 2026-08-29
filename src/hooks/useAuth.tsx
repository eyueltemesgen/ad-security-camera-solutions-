import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiGet, apiPost, apiPatch, apiPut, setToken, getToken, ApiError } from '../lib/api';
import type { User } from '../types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { full_name: string; email: string; phone: string; password: string }) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'full_name' | 'phone' | 'avatar_url'>>) => Promise<User>;
  changePassword: (current: string, next: string) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      apiGet<{ user: User; addresses: unknown[] }>('/api/auth/me')
        .then((r) => setUser(r.user))
        .catch(() => setToken(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<{ token: string; user: User }>('/api/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (data: { full_name: string; email: string; phone: string; password: string }) => {
      const res = await apiPost<{ token: string; user: User }>('/api/auth/register', data);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    const r = await apiGet<{ user: User; addresses: unknown[] }>('/api/auth/me');
    setUser(r.user);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Pick<User, 'full_name' | 'phone' | 'avatar_url'>>) => {
      const res = await apiPut<{ user: User }>('/api/auth/me', data);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const changePassword = useCallback(async (current: string, next: string) => {
    await apiPut('/api/auth/me/password', { current_password: current, new_password: next });
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refresh,
      updateProfile,
      changePassword,
    }),
    [user, loading, login, register, logout, refresh, updateProfile, changePassword],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong';
}