'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'Failed to sign out' };
  }
}

export async function signIn(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Rate limit check
    if (!await checkRateLimit(email)) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    revalidatePath('/');
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

export async function signUp(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    if (!email || !password || !fullName) {
      throw new Error('All fields are required');
    }

    // Validate email domain for THY employees
    if (!email.endsWith('@thy.com')) {
      throw new Error('Only THY employees can register');
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Create profile in profiles table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
          },
        ]);

      if (profileError) throw profileError;
    }

    revalidatePath('/');
    return { 
      success: true, 
      message: 'Please check your email to confirm your account' 
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

export async function resetPassword(formData: FormData) {
  try {
    const email = formData.get('email') as string;

    if (!email) {
      throw new Error('Email is required');
    }

    // Rate limit check
    if (!await checkRateLimit(email)) {
      throw new Error('Too many password reset attempts. Please try again later.');
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) throw error;

    return { 
      success: true, 
      message: 'Password reset instructions have been sent to your email' 
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const password = formData.get('password') as string;

    if (!password) {
      throw new Error('New password is required');
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) throw error;

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Password update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

// Rate limiting for auth attempts
let authAttempts: { [key: string]: { count: number; lastAttempt: number } } = {};

export async function checkRateLimit(email: string): Promise<boolean> {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  // Clean up old entries
  Object.keys(authAttempts).forEach(key => {
    if (now - authAttempts[key].lastAttempt > windowMs) {
      delete authAttempts[key];
    }
  });

  if (!authAttempts[email]) {
    authAttempts[email] = { count: 1, lastAttempt: now };
    return true;
  }

  const attempt = authAttempts[email];
  if (now - attempt.lastAttempt > windowMs) {
    authAttempts[email] = { count: 1, lastAttempt: now };
    return true;
  }

  if (attempt.count >= maxAttempts) {
    return false;
  }

  attempt.count++;
  attempt.lastAttempt = now;
  return true;
}
