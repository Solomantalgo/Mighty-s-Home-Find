import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { acceptStaffInvitationAction } from "@/app/admin/invite/actions";

export const dynamic = "force-dynamic";

export default async function AcceptStaffInvitationPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=Supabase%20is%20not%20configured");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login?error=Open%20your%20invitation%20email%20link%20to%20continue");
  const { data: profile } = await supabase.from("staff_profiles").select("email,invitation_status,is_active").eq("user_id", user.id).maybeSingle();
  if (!profile || profile.invitation_status !== "pending" || !profile.is_active) redirect("/admin/login?error=This%20invitation%20is%20not%20active");
  const { error } = await searchParams;
  return <main className="admin-login-page"><section className="admin-login-card"><Link className="admin-login-logo" href="/" aria-label="Mighty’s Home Finds storefront"><Image src="/assets/brand/mightys-home-finds-logo.png" alt="Mighty’s Home Finds — Home and Living Essentials" width={2172} height={724} priority/></Link><span className="admin-login-label">STAFF INVITATION</span><h1>Set your password</h1><p>Complete your staff access for {profile.email}.</p>{error&&<div className="admin-alert" role="alert">{error}</div>}<form action={acceptStaffInvitationAction}><label>Password<input required name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password"/></label><label>Confirm password<input required name="password_confirmation" type="password" minLength={12} maxLength={128} autoComplete="new-password"/></label><button className="admin-primary">Activate staff access</button></form><Link className="admin-back" href="/admin/login">Already activated? Sign in</Link></section></main>;
}
