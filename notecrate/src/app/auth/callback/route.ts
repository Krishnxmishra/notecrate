import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      // Check if this is a new user (no role set yet) — send to onboarding
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (!profile?.role) {
          return NextResponse.redirect(`${origin}/signup?step=-1`);
        }
      }

      // Returning user or login flow — sync session then go to dashboard
      return NextResponse.redirect(`${origin}/auth/sync?next=%2Fdashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
