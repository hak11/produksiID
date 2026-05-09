'use server';

import { createClient } from '@/lib/supabase/server';

export async function getUser() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  // Get user profile with team info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get team membership
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('user_id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.user_metadata?.name,
    role: profile?.role || 'member',
    teamId: teamMember?.team_id,
    phone: user.user_metadata?.phone,
    image: user.user_metadata?.avatar_url,
  };
}

export async function getUserWithTeam(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: teamMember } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('user_id', userId)
    .single();

  return {
    user: profile,
    teamId: teamMember?.team_id,
  };
}

export async function getTeamForUser(userId: string) {
  const supabase = await createClient();

  const { data: teamMember } = await supabase
    .from('team_members')
    .select(`
      team_id,
      role,
      teams (
        id,
        name,
        address,
        phone,
        email,
        npwp,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .single();

  if (!teamMember?.teams) {
    return null;
  }

  // Get team members
  const { data: members } = await supabase
    .from('team_members')
    .select(`
      id,
      user_id,
      role,
      joined_at,
      profiles (
        id,
        name,
        email
      )
    `)
    .eq('team_id', teamMember.team_id);

  return {
    ...teamMember.teams,
    members: members?.map(m => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joined_at,
      user: m.profiles,
    })) || [],
  };
}

export async function getActivityLogs() {
  const supabase = await createClient();
  
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      id,
      action,
      timestamp,
      ip_address,
      profiles (
        name
      )
    `)
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }

  return data?.map(log => ({
    id: log.id,
    action: log.action,
    timestamp: log.timestamp,
    ipAddress: log.ip_address,
    userName: log.profiles?.name,
  })) || [];
}

export async function getTeamMembers(teamId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('team_members')
    .select(`
      id,
      user_id,
      role,
      joined_at,
      profiles (
        id,
        name,
        email
      )
    `)
    .eq('team_id', teamId);

  if (error) {
    throw error;
  }

  return data?.map(m => ({
    id: m.id,
    userId: m.user_id,
    role: m.role,
    joinedAt: m.joined_at,
    user: m.profiles,
  })) || [];
}

// Delivery Notes
export async function getDeliveryNotes(teamId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('delivery_notes')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getDeliveryNoteById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('delivery_notes')
    .select(`
      *,
      delivery_items (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Customers/Suppliers
export async function getCustomersSuppliers(teamId: string, role?: 'customer' | 'supplier') {
  const supabase = await createClient();

  let query = supabase
    .from('customers_suppliers')
    .select('*')
    .eq('team_id', teamId);

  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

// Orders
export async function getOrders(teamId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers_suppliers (
        id,
        name,
        email,
        phone
      )
    `)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

// Invoices
export async function getInvoices(teamId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customers_suppliers (
        id,
        name,
        email,
        phone
      ),
      invoice_items (*)
    `)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getInvoiceById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customers_suppliers (*),
      invoice_items (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Drivers
export async function getDrivers(teamId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

// Invitations
export async function getInvitations(teamId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      profiles:invited_by (
        name,
        email
      )
    `)
    .eq('team_id', teamId)
    .order('invited_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

// Activity logging
export async function logActivity(
  teamId: string,
  userId: string,
  action: string,
  ipAddress?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('activity_logs')
    .insert({
      team_id: teamId,
      user_id: userId,
      action,
      ip_address: ipAddress,
    });

  if (error) {
    console.error('Error logging activity:', error);
  }
}
