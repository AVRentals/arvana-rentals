import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getProfile } from '@/lib/supabase';
import { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Build a fake User-like object from the demo localStorage entry
const buildDemoUser = (raw: string): User | null => {
  try {
    const data = JSON.parse(raw);
    return {
      id: data.id,
      email: data.email,
      user_metadata: { full_name: data.full_name },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;
  } catch {
    return null;
  }
};

const buildDemoProfile = (raw: string): Profile | null => {
  try {
    const data = JSON.parse(raw);
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name || data.email?.split('@')[0] || 'Driver',
      avatar_url: null,
      is_host: false,
      is_verified: false,
      rating: 5,
      total_trips: 0,
      created_at: new Date().toISOString(),
    } as unknown as Profile;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await getProfile(userId);
    if (data) setProfile(data as Profile);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    // --- 1. Check for demo user first (no Supabase needed) ---
    const demoRaw = localStorage.getItem('demo_user');
    if (demoRaw) {
      const demoUser = buildDemoUser(demoRaw);
      const demoProfile = buildDemoProfile(demoRaw);
      if (demoUser) {
        setUser(demoUser);
        setProfile(demoProfile);
        setLoading(false);
        return; // skip Supabase check
      }
    }

    // --- 2. Try real Supabase session ---
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    }).catch(() => {
      // Supabase not configured — just finish loading
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // Only handle if no demo user is active
        if (localStorage.getItem('demo_user')) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    // Clear demo session
    localStorage.removeItem('demo_user');
    // Clear real Supabase session if any
    try { await supabase.auth.signOut(); } catch { /* no-op */ }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut: handleSignOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
