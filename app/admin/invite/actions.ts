"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function acceptStaffInvitationAction(formData: FormData) {
  const password = formData.get("password");
  const confirmation = formData.get("password_confirmation");
  if (typeof password !== "string" || password.length < 12 || password.length > 128 || password !== confirmation) {
    redirect("/admin/invite/accept?error=Choose%20a%20matching%20password%20with%20at%20least%2012%20characters");
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=Supabase%20is%20not%20configured");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login?error=Open%20the%20invitation%20link%20from%20your%20email%20again");
  const { data: profile } = await supabase.from("staff_profiles").select("user_id,invitation_status,is_active").eq("user_id", user.id).maybeSingle();
  if (!profile || profile.invitation_status !== "pending" || !profile.is_active) redirect("/admin/login?error=This%20invitation%20is%20not%20active");
  const { error: passwordError } = await supabase.auth.updateUser({ password });
  if (passwordError) redirect("/admin/invite/accept?error=Could%20not%20set%20password.%20Use%20a%20longer%20password%20and%20try%20again");
  const { error } = await supabase.rpc("accept_staff_invitation");
  if (error) redirect("/admin/login?error=Could%20not%20activate%20this%20staff%20profile.%20Contact%20the%20Home%20Finds%20owner");
  redirect("/admin");
}
