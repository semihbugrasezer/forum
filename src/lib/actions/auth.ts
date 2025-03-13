"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { type Provider } from "@supabase/supabase-js";

export async function signUp(email: string, password: string, name: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      data: {
        name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create profile 
  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      email: email,
      display_name: name,
      role: "user",
    });
  }
  
  revalidatePath("/");
  return { success: true };
}

export async function signIn(email: string, password: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Update last login
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("profiles").update({
      last_login: new Date().toISOString(),
    }).eq("id", user.id);
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

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signInWithProvider(provider: Provider) {
  const cookieStore = cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });
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
  const supabase = createServerActionClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }
  
  return session.user;
}