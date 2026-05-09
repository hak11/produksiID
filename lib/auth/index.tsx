'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

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
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
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

          setUser({
            id: authUser.id,
            email: authUser.email,
            name: profile?.name || authUser.user_metadata?.name,
            role: profile?.role || 'member',
            teamId: teamMember?.team_id,
            phone: authUser.user_metadata?.phone,
            image: authUser.user_metadata?.avatar_url,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('[v0] Error getting initial session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[v0] Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // Get team membership
          const { data: teamMember } = await supabase
            .from('team_members')
            .select('team_id, role')
            .eq('user_id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.user_metadata?.name,
            role: profile?.role || 'member',
            teamId: teamMember?.team_id,
            phone: session.user.user_metadata?.phone,
            image: session.user.user_metadata?.avatar_url,
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}
