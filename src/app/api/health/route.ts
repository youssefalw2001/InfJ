import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    app: "manywise",
    persistence: isSupabaseServerConfigured() ? "supabase" : "local-demo",
  });
}
