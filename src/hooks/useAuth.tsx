import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResult {
  error: string | null;
  /** True when Supabase email confirmation is enabled — user must verify email before logging in. */
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  /** Re-send the signup confirmation email (for Option-B confirmation flow). */
  resendConfirmation: (email: string) => Promise<string | null>;
  sendPasswordReset: (email: string) => Promise<string | null>;
  updatePassword: (newPassword: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateProfile: (updates: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('Failed to load profile:', error.message);
      return;
    }
    setProfile(data as Profile | null);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        if (data.session?.user) {
          void loadProfile(data.session.user.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        if (nextSession?.user) {
          void loadProfile(nextSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const notConfigured = (): AuthResult => ({
    error:
      'Backend is not configured yet — VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. Contact the site administrator.',
  });

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return notConfigured();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return { error: null };
    if (error.message.toLowerCase().includes('failed to fetch')) {
      return {
        error:
          'Cannot reach the Supabase server — check your internet connection, and that VITE_SUPABASE_URL is correct and the Supabase project is not paused.',
      };
    }
    // Map common Supabase errors to actionable messages
    if (error.message.includes('Email not confirmed')) {
      return {
        error:
          'Your account exists, but your email is not confirmed yet. Please check your inbox for the confirmation link.',
      };
    }
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Wrong email or password.' };
    }
    return { error: error.message };
  }, []);

  const signUp = useCallback(async (input: SignUpInput): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return notConfigured();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { full_name: input.fullName, phone: input.phone },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'An account with this email already exists — try logging in.' };
      }
      return { error: error.message };
    }
    // Supabase with email confirmation ON returns a user but NO session.
    const needsEmailConfirmation = Boolean(data.user) && !data.session;
    return { error: null, needsEmailConfirmation };
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) return notConfigured().error;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return error ? error.message : null;
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) return notConfigured().error;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? error.message : null;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!isSupabaseConfigured) return notConfigured().error;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(
    async (updates: { full_name?: string; phone?: string; avatar_url?: string }) => {
      if (!session?.user) return 'Not authenticated';
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);
      if (error) return error.message;
      await loadProfile(session.user.id);
      return null;
    },
    [session, loadProfile]
  );

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isAdmin: profile?.role === 'admin',
      loading,
      signIn,
      signUp,
      resendConfirmation,
      sendPasswordReset,
      updatePassword,
      signOut,
      updateProfile,
      refreshProfile,
    }),
    [session, profile, loading, signIn, signUp, resendConfirmation, sendPasswordReset, updatePassword, signOut, updateProfile, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
