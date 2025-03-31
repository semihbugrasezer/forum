"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { type Provider } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Helper function to get cookie store with proper typing
function getCookieStore() {
  return cookies();
}

export async function signUp(emailOrFormData: string | FormData, password?: string, name?: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  let email: string;
  let pass: string;
  let displayName: string;

  if (emailOrFormData instanceof FormData) {
    email = emailOrFormData.get("email") as string;
    pass = emailOrFormData.get("password") as string;
    displayName = emailOrFormData.get("name") as string;
  } else {
    email = emailOrFormData;
    pass = password!;
    displayName = name!;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      data: {
        name: displayName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create profile 
  if (data.user) {
    try {
      // Cast to any to bypass typechecking issues temporarily
      await (supabase.from("profiles") as any).insert({
        id: data.user.id,
        username: email.split('@')[0], // Generate a username from email
        full_name: displayName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (profileError) {
      console.error("Error creating profile:", profileError);
      // Continue even if profile creation fails - auth is successful
    }
  }
  
  revalidatePath("/");
  return { success: true };
}

export async function signIn(emailOrFormData: string | FormData, password?: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  let email: string;
  let pass: string;

  if (emailOrFormData instanceof FormData) {
    email = emailOrFormData.get("email") as string;
    pass = emailOrFormData.get("password") as string;
  } else {
    email = emailOrFormData;
    pass = password!;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) {
    return { error: error.message };
  }

  // Update last login
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      // Cast to any to bypass typechecking issues temporarily
      await (supabase.from("profiles") as any).update({
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
    } catch (updateError) {
      console.error("Error updating last login:", updateError);
      // Continue anyway, this is not critical
    }
  }

  revalidatePath("/");
  return { success: true };
}

export async function signOut() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  await supabase.auth.signOut();
  revalidatePath("/");
  return { success: true };
}

export async function requireAuth() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }
  
  return session;
}

export async function signInWithProvider(provider: Provider) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

export async function getUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }
  
  return session.user;
}