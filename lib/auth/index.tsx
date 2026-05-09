'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type UserWithTeamId = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string;
  teamId?: string;
  phone?: string | null;
  image?: string | null;
};

export type UserContextType = {
  user: UserWithTeamId | null;
  setUser: (user: UserWithTeamId | null) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithTeamId | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = useMemo(() => createClient(), []);

  const fetchUserData = useCallback(async (authUser: User) => {
    try {
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Get team membership
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', authUser.id)
        .single();

      return {
        id: authUser.id,
        email: authUser.email,
        name: profile?.name || authUser.user_metadata?.name,
        role: teamMember?.role || profile?.role || 'member',
        teamId: teamMember?.team_id,
        phone: authUser.user_metadata?.phone,
        image: authUser.user_metadata?.avatar_url,
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name,
        role: 'member',
      };
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    // Get initial session using getSession (faster than getUser for initial load)
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const userData = await fetchUserData(session.user);
          if (mounted) {
            setUser(userData);
          }
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            const userData = await fetchUserData(session.user);
            if (mounted) {
              setUser(userData);
              setLoading(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserData]);

  const value = useMemo(() => ({ user, setUser, loading }), [user, loading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
