import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export async function createSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; proxy.ts refreshes sessions.
        }
      },
    },
  });
}

export const requireAdmin = cache(async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null, error: "Supabase is not configured." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "Sign in to continue." };
  const { data: staff, error } = await supabase
    .from("staff_profiles")
    .select("role,display_name,is_active,invitation_status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !staff || !staff.is_active || staff.invitation_status !== "accepted") return { supabase, user: null, error: "This account is not authorised for catalogue administration." };
  return { supabase, user: { ...user, role: staff.role as string, displayName: staff.display_name as string | null }, error: null };
});

export async function requireOwner() {
  const auth = await requireAdmin();
  if (!auth.user || !auth.supabase) return auth;
  if (auth.user.role !== "owner") return { ...auth, user: null, error: "Owner access is required for staff management." };
  return auth;
}
