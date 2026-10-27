import "server-only";
import { cache } from "react";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export interface SafeViewer {
  id: string;
  handle: string;
  displayName: string;
  role: "member" | "moderator" | "admin";
}

export const getViewer = cache(async (): Promise<SafeViewer | null> => {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("username, display_name, role, is_suspended")
    .eq("id", user.id)
    .single();

  if (!data || data.is_suspended) return null;
  return { id: user.id, handle: data.username, displayName: data.display_name, role: data.role };
});

export async function requireSteward() {
  const viewer = await getViewer();
  if (!viewer || !["moderator", "admin"].includes(viewer.role)) {
    throw new Error("Not authorized");
  }
  return viewer;
}
