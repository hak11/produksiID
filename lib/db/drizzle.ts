// This file is kept for backward compatibility
// The application now uses Supabase client directly
// See lib/supabase/client.ts and lib/supabase/server.ts

import { createClient } from '@/lib/supabase/server';

// Export a function to get Supabase client for backward compatibility
export async function getSupabaseClient() {
  return await createClient();
}

// Placeholder db object - not used, but kept for compatibility
// All database operations should use Supabase client directly
export const db = null as any;
