import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile } from '@/types/database';
import type { UserRole } from '@/types/permissions';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_ROLE: UserRole = 'viewer';

function computeRole(profile: Profile | null): UserRole {
  if (!profile) return DEFAULT_ROLE;
  const role = profile.role as UserRole | undefined;
  if (role && ['super_admin', 'admin', 'caregiver', 'viewer'].includes(role)) {
    return role;
  }
  return DEFAULT_ROLE;
}

function computeIsSuperAdmin(profile: Profile | null): boolean {
  return profile?.is_super_admin === true;
}

function computeIsAdmin(profile: Profile | null, role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin' || computeIsSuperAdmin(profile);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    role: DEFAULT_ROLE,
    isAdmin: false,
    isSuperAdmin: false,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    if (profile) {
      const role = computeRole(profile);
      const isSuperAdmin = computeIsSuperAdmin(profile);
      const isAdmin = computeIsAdmin(profile, role);
      setState((prev) => ({ ...prev, profile, role, isAdmin, isSuperAdmin }));
    }
  }, [state.user, fetchProfile]);

  useEffect(() => {
    let isMounted = true;
    let initialSessionHandled = false;

    const handleSession = async (session: Session | null) => {
      const user = session?.user ?? null;

      if (user) {
        const profile = await fetchProfile(user.id);
        if (!isMounted) return;

        const role = computeRole(profile);
        const isSuperAdmin = computeIsSuperAdmin(profile);
        const isAdmin = computeIsAdmin(profile, role);

        setState({
          user,
          profile,
          session,
          isLoading: false,
          isAuthenticated: true,
          role,
          isAdmin,
          isSuperAdmin,
        });
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          role: DEFAULT_ROLE,
          isAdmin: false,
          isSuperAdmin: false,
        });
      }
    };

    // getSession() handles token refresh automatically before returning
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      initialSessionHandled = true;
      handleSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      // Skip INITIAL_SESSION since getSession() handles it (avoids race condition)
      if (event === 'INITIAL_SESSION' && !initialSessionHandled) {
        return;
      }

      handleSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) throw new Error('No user logged in');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase
      .from('profiles') as any)
      .update(updates)
      .eq('id', state.user.id);

    if (error) throw error;
    await refreshProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
