import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_ORIGINS = [
  `chrome-extension://${process.env.NEXT_PUBLIC_EXTENSION_ID}`,
  `chrome-extension://${process.env.NEXT_PUBLIC_EXTENSION_ID_DEV}`,
].filter(Boolean);

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed ?? "",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ session: null }, { headers: corsHeaders(origin) });
  }

  // Verify user still exists — catches deleted accounts where cookie is still present
  const { error } = await supabase.auth.getUser();
  if (error) {
    return NextResponse.json({ session: null }, { headers: corsHeaders(origin) });
  }

  return NextResponse.json(
    {
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      },
    },
    { headers: corsHeaders(origin) }
  );
}
