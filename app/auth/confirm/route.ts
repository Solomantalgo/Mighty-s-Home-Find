import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeNext(url.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();
  if (!supabase || !tokenHash || type !== "invite") return NextResponse.redirect(new URL("/admin/login?error=Invitation%20link%20is%20invalid%20or%20expired", url.origin));
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "invite" });
  if (error) return NextResponse.redirect(new URL("/admin/login?error=Invitation%20link%20is%20invalid%20or%20expired", url.origin));
  return NextResponse.redirect(new URL(next, url.origin));
}
