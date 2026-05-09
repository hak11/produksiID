'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const companyName = formData.get('companyName') as string;
  const companyCategory = formData.get('companyCategory') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        name,
        phone,
        company_name: companyName,
        company_category: companyCategory,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is disabled, create team and team member
  if (data.user && data.session) {
    // Create team for the new user
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: `${companyName}'s Team`,
        email,
        phone,
      })
      .select()
      .single();

    if (teamError) {
      console.error('Error creating team:', teamError);
      return { error: 'Failed to create team' };
    }

    // Add user as team member with owner role
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        user_id: data.user.id,
        team_id: team.id,
        role: 'owner',
      });

    if (memberError) {
      console.error('Error creating team member:', memberError);
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }

  // If email confirmation is required
  return { success: 'Check your email for confirmation link' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/sign-in');
}

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
    .select('team_id, role, teams(*)')
    .eq('user_id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.user_metadata?.name,
    role: profile?.role || 'member',
    teamId: teamMember?.team_id,
    team: teamMember?.teams,
    phone: user.user_metadata?.phone,
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

export async function updatePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();

  // First verify current password by re-authenticating
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    return { error: 'User not found' };
  }

  // Try to sign in with current password to verify
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return { error: 'Current password is incorrect' };
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Password updated successfully' };
}

export async function updateAccount(name: string, email: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'User not found' };
  }

  // Update auth email if changed
  if (email !== user.email) {
    const { error: authError } = await supabase.auth.updateUser({ email });
    if (authError) {
      return { error: authError.message };
    }
  }

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ name, email, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath('/', 'layout');
  return { success: 'Account updated successfully' };
}

export async function deleteAccount(password: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    return { error: 'User not found' };
  }

  // Verify password
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (verifyError) {
    return { error: 'Incorrect password' };
  }

  // Soft delete profile
  const { error: deleteError } = await supabase
    .from('profiles')
    .update({ 
      deleted_at: new Date().toISOString(),
      email: `${user.email}-${user.id}-deleted`,
    })
    .eq('id', user.id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  // Remove from team
  await supabase
    .from('team_members')
    .delete()
    .eq('user_id', user.id);

  // Sign out
  await supabase.auth.signOut();
  
  redirect('/sign-in');
}
