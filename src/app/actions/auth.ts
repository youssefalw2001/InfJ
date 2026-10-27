"use server";

import { redirect } from "next/navigation";
import { credentialsSchema } from "@/lib/validation";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export type AuthActionState = { message?: string; errors?: Record<string, string[]> };

export async function signIn(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  if (!isSupabaseServerConfigured()) return { message: "Cloud sign-in is unavailable in local demo mode." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { message: "We could not sign you in. Check your details and try again." };
  redirect("/home");
}

export async function signUp(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  if (!isSupabaseServerConfigured()) return { message: "Cloud registration is unavailable in local demo mode." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) return { message: "We could not create that account. Try another email or return later." };
  redirect("/onboarding");
}
