import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/server";
import { AdminNav, AdminHeaderBrand } from "@/app/admin/products/page";

export const dynamic = "force-dynamic";

type AuditValue = Record<string, unknown> | null;
const label = (value: unknown) => typeof value === "string" && value.trim() ? value : null;
function describeChange(event: { action: string; entity_table: string; before_data: AuditValue; after_data: AuditValue }) {
  const before = event.before_data ?? {};
  const after = event.after_data ?? {};
  const name = label(after.name) ?? label(before.name) ?? label(after.email) ?? label(before.email) ?? (event.entity_table === "variants" ? `${String(after.design ?? before.design ?? "Bed")} · ${String(after.colour ?? before.colour ?? "finish")}` : null) ?? "item";
  const entity = ({ products: "product", categories: "category", variants: "image set", product_images: "product image", configurator_assets: "matched image", catalogue_options: "shared catalogue options", staff_profiles: "staff member" } as Record<string, string>)[event.entity_table] ?? "catalogue item";
  const actions: Record<string, string> = { INSERT: "Added", UPDATE: "Updated", DELETE: "Removed", staff_invited: "Invited", staff_provisioned: "Provisioned", staff_invitation_revoked: "Revoked invitation for", staff_invitation_accepted: "Accepted invitation for", staff_invitation_resent: "Resent invitation to", staff_role_changed: "Changed role for", staff_deactivated: "Deactivated", staff_reactivated: "Reactivated", staff_removed: "Removed", staff_removal_requested: "Requested removal of", staff_invitation_resend_failed: "Could not resend invitation to" };
  const verb = actions[event.action] ?? "Changed";
  const details: string[] = [];
  if (before.status !== after.status && label(after.status)) details.push(`Status: ${String(before.status ?? "new")} → ${String(after.status)}`);
  if (before.role !== after.role && label(after.role)) details.push(`Role: ${String(before.role ?? "new").replaceAll("_", " ")} → ${String(after.role).replaceAll("_", " ")}`);
  if (event.entity_table === "catalogue_options" && JSON.stringify(before.sizes) !== JSON.stringify(after.sizes)) details.push("Updated shared bed sizes or prices");
  if (before.name !== after.name && label(before.name) && label(after.name)) details.push(`Renamed from ${before.name}`);
  if (before.is_active !== after.is_active && typeof after.is_active === "boolean") details.push(after.is_active ? "Access enabled" : "Access disabled");
  return { title: `${verb} ${entity}: ${name}`, details: details.join(" · ") };
}

export default async function ActivityPage() {
  const { supabase, user } = await requireAdmin();
  if (!user || !supabase) redirect("/admin/login");
  const [{ data: events }, { data: staff }] = await Promise.all([
    supabase.from("catalogue_audit_log").select("id,actor_id,actor_email,action,entity_table,entity_id,before_data,after_data,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("staff_profiles").select("user_id,display_name,email"),
  ]);
  const names = new Map((staff ?? []).map((person) => [person.user_id, person.display_name || person.email]));
  return <div className="admin-shell"><AdminNav active="Activity"/><main className="admin-main"><header className="admin-topbar"><div><span className="admin-kicker">CATALOGUE</span><h1>Activity</h1></div><AdminHeaderBrand/></header><section className="admin-content"><div className="admin-panel"><div className="admin-panel-head"><div><h2>Catalogue changes</h2><p>Latest 100 recorded edits, in time order.</p></div></div>{events?.length ? <div className="admin-activity-list">{events.map((event) => { const change = describeChange(event); const actor = event.actor_id === user.id ? `You (${user.displayName || user.email})` : event.actor_id ? names.get(event.actor_id) ?? event.actor_email ?? "Former staff member" : event.actor_email ?? "System"; return <article key={event.id}><span className="admin-activity-dot"/><div><b>{actor}: {change.title}</b><small>{new Date(event.created_at).toLocaleString()}</small>{change.details && <p className="admin-activity-detail">{change.details}</p>}</div></article>; })}</div> : <div className="admin-empty">No catalogue activity recorded yet.</div>}</div></section></main></div>;
}
