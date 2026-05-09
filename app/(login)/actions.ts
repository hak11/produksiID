'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUser, getUserWithTeam, logActivity } from '@/lib/supabase/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '@/lib/auth/middleware';

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password,
    };
  }

  // Log activity
  if (authData.user) {
    const userWithTeam = await getUserWithTeam(authData.user.id);
    if (userWithTeam?.teamId) {
      await logActivity(userWithTeam.teamId, authData.user.id, 'SIGN_IN');
    }
  }

  revalidatePath('/', 'layout');

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    // Handle checkout redirect if needed
    redirect('/dashboard');
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  name: z.string(),
  phone: z.string(),
  companyName: z.string(),
  companyCategory: z.string().optional(),
  inviteId: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { name, phone, companyName, companyCategory, email, password, inviteId } = data;
  const supabase = await createClient();

  // Check if user already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (existingProfile) {
    return {
      error: 'User with this email already exists.',
      email,
      password,
    };
  }

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
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

  if (authError) {
    return {
      error: authError.message,
      email,
      password,
    };
  }

  // If there's a session (email confirmation disabled), create team
  if (authData.user && authData.session) {
    let teamId: string;
    let userRole: 'admin' | 'member' | 'owner' = 'owner';

    if (inviteId) {
      // Check for valid invitation
      const { data: invitation } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', inviteId)
        .eq('email', email)
        .eq('status', 'pending')
        .single();

      if (invitation) {
        teamId = invitation.team_id;
        userRole = invitation.role as 'admin' | 'member' | 'owner';

        // Update invitation status
        await supabase
          .from('invitations')
          .update({ status: 'accepted' })
          .eq('id', inviteId);

        await logActivity(teamId, authData.user.id, 'ACCEPT_INVITATION');
      } else {
        return { error: 'Invalid or expired invitation.', email, password };
      }
    } else {
      // Create a new team
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: `${companyName}'s Team`,
          email,
          phone,
        })
        .select()
        .single();

      if (teamError || !newTeam) {
        return {
          error: 'Failed to create team. Please try again.',
          email,
          password,
        };
      }

      teamId = newTeam.id;
      await logActivity(teamId, authData.user.id, 'CREATE_TEAM');
    }

    // Add user to team
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        user_id: authData.user.id,
        team_id: teamId,
        role: userRole,
      });

    if (memberError) {
      console.error('Error creating team member:', memberError);
    }

    await logActivity(teamId, authData.user.id, 'SIGN_UP');

    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }

  // If email confirmation is required
  redirect('/sign-in?message=Check your email for confirmation link');
});

export async function signOut() {
  const supabase = await createClient();
  
  const user = await getUser();
  if (user?.teamId) {
    await logActivity(user.teamId, user.id, 'SIGN_OUT');
  }

  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/sign-in');
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;
    const supabase = await createClient();

    // Verify current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      return { error: 'Current password is incorrect.' };
    }

    if (currentPassword === newPassword) {
      return {
        error: 'New password must be different from the current password.',
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { error: updateError.message };
    }

    const userWithTeam = await getUserWithTeam(user.id);
    if (userWithTeam?.teamId) {
      await logActivity(userWithTeam.teamId, user.id, 'UPDATE_PASSWORD');
    }

    return { success: 'Password updated successfully.' };
  },
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;
    const supabase = await createClient();

    // Verify password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (verifyError) {
      return { error: 'Incorrect password. Account deletion failed.' };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    if (userWithTeam?.teamId) {
      await logActivity(userWithTeam.teamId, user.id, 'DELETE_ACCOUNT');
    }

    // Soft delete profile
    await supabase
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString(),
        email: `${user.email}-${user.id}-deleted`,
      })
      .eq('id', user.id);

    // Remove from team
    if (userWithTeam?.teamId) {
      await supabase
        .from('team_members')
        .delete()
        .eq('user_id', user.id)
        .eq('team_id', userWithTeam.teamId);
    }

    await supabase.auth.signOut();
    redirect('/sign-in');
  },
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const supabase = await createClient();

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ name, email, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (profileError) {
      return { error: profileError.message };
    }

    // Update auth email if changed
    if (email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({ email });
      if (authError) {
        return { error: authError.message };
      }
    }

    const userWithTeam = await getUserWithTeam(user.id);
    if (userWithTeam?.teamId) {
      await logActivity(userWithTeam.teamId, user.id, 'UPDATE_ACCOUNT');
    }

    revalidatePath('/', 'layout');
    return { success: 'Account updated successfully.' };
  },
);

const removeTeamMemberSchema = z.object({
  memberId: z.string(),
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const supabase = await createClient();

    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('team_id', userWithTeam.teamId);

    await logActivity(userWithTeam.teamId, user.id, 'REMOVE_TEAM_MEMBER');

    revalidatePath('/', 'layout');
    return { success: 'Team member removed successfully' };
  },
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member']),
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const supabase = await createClient();

    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', userWithTeam.teamId)
      .eq('user_id', (
        await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single()
      ).data?.id || '')
      .single();

    if (existingMember) {
      return { error: 'User is already a member of this team' };
    }

    // Check for existing invitation
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('id')
      .eq('team_id', userWithTeam.teamId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create invitation
    const { error: inviteError } = await supabase
      .from('invitations')
      .insert({
        team_id: userWithTeam.teamId,
        email,
        role,
        invited_by: user.id,
        status: 'pending',
      });

    if (inviteError) {
      return { error: inviteError.message };
    }

    await logActivity(userWithTeam.teamId, user.id, 'INVITE_TEAM_MEMBER');

    return { success: 'Invitation sent successfully' };
  },
);
