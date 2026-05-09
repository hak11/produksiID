// This file is kept for backward compatibility
// The application now uses Supabase Auth directly
// See lib/supabase/auth-actions.ts

import { createClient } from '@/lib/supabase/server';

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;
  
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
    },
    expires: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : '',
  };
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// These functions are no longer used with Supabase Auth
// Kept for backward compatibility but should not be called
export async function hashPassword(password: string) {
  throw new Error('hashPassword is not used with Supabase Auth');
}

export async function comparePasswords(plainTextPassword: string, hashedPassword: string) {
  throw new Error('comparePasswords is not used with Supabase Auth');
}

export async function signToken(payload: any) {
  throw new Error('signToken is not used with Supabase Auth');
}

export async function verifyToken(input: string) {
  throw new Error('verifyToken is not used with Supabase Auth');
}

export async function setSession(user: any, teamId: string) {
  // Session is managed by Supabase Auth automatically
  console.warn('setSession is not used with Supabase Auth - session is managed automatically');
}
