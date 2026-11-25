import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Plus, Search, LayoutDashboard, Package, Tags, History, Users, LogOut, SlidersHorizontal } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { signOutAction } from "@/app/admin/actions";
import { ProductListActions } from "@/app/admin/forms";
import { AdminNavLink } from "@/app/admin/nav-link";

export const dynamic = "force-dynamic";
type ProductListRow = { id: string; name: string; slug: string; status: string; updated_at: string; categories: { name: string } | { name: string }[] | null; variants: { id: string; is_active: boolean }[]; product_images: { id: string; is_primary: boolean; image_url: string }[] };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; deleted?: string }> }) {
  const { supabase, user } = await requireAdmin();
  if (!user || !supabase) redirect("/admin/login");
  const params = await searchParams;
  let query = supabase.from("products").select("id,name,slug,status,updated_at,categories(name),variants(id,is_active),product_images(id,is_primary,image_url)").order("updated_at", { ascending: false }).limit(100);
  if (params.q) query = query.ilike("name", `%${params.q.replace(/[%_*]/g, "")}%`);
  if (["draft", "published", "archived"].includes(params.status ?? "")) query = query.eq("status", params.status!);
  const { data: products } = await query;
  const rows = (products ?? []) as ProductListRow[];
  const categoryName = (category: ProductListRow["categories"]) => Array.isArray(category) ? category[0]?.name : category?.name;
  return <div className="admin-shell"><AdminNav active="Products"/><main className="admin-main"><header className="admin-topbar"><div><span className="admin-kicker">CATALOGUE</span><h1>Products</h1></div><div className="admin-topbar-end"><AdminHeaderBrand/><Link className="admin-primary admin-link-button" href="/admin/products/new"><Plus size={17}/> Add product</Link></div></header><section className="admin-content">
    {params.deleted && <p className="admin-form-success" role="status">Product deleted.</p>}
    <form className="admin-filters"><label className="admin-search"><Search size={16}/><input name="q" defaultValue={params.q} placeholder="Search product names"/></label><select name="status" defaultValue={params.status ?? "all"}><option value="all">All listings</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><button className="admin-secondary">Filter</button></form>
    <div className="admin-panel admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Image sets</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{rows.map((p)=><tr key={p.id}><td><Link className="admin-product-link" href={`/admin/products/${p.id}`}>{p.product_images?.[0]?.image_url ? <Image unoptimized width={42} height={42} src={p.product_images.find((i)=>i.is_primary)?.image_url ?? p.product_images[0].image_url} alt=""/> : <span className="admin-thumb-placeholder">HF</span>}<span><b>{p.name}</b><small>/{p.slug}</small></span></Link></td><td>{categoryName(p.categories) ?? "—"}</td><td>{p.variants?.filter((v)=>v.is_active).length ?? 0}</td><td><span className={`status-pill status-${p.status}`}>{p.status}</span></td><td>{new Date(p.updated_at).toLocaleDateString()}</td><td><ProductListActions productId={p.id} status={p.status}/></td></tr>)}</tbody></table>
    <div className="admin-mobile-products">{rows.map((p) => { const imageUrl = p.product_images?.find((image) => image.is_primary)?.image_url ?? p.product_images?.[0]?.image_url; return <article className="admin-mobile-product" key={p.id}><div className="admin-mobile-product-top">{imageUrl ? <Image unoptimized width={84} height={84} src={imageUrl} alt=""/> : <span className="admin-thumb-placeholder">HF</span>}<div className="admin-mobile-product-title"><b>{p.name}</b><span>{categoryName(p.categories) ?? "Uncategorised"}</span><em className={`status-pill status-${p.status}`}>{p.status}</em></div></div><dl><div><dt>Image sets</dt><dd>{p.variants?.filter((v) => v.is_active).length ?? 0}</dd></div><div><dt>Updated</dt><dd>{new Date(p.updated_at).toLocaleDateString()}</dd></div></dl><div className="admin-mobile-product-actions"><Link className="admin-primary admin-link-button" href={`/admin/products/${p.id}`}>Edit product</Link><ProductListActions productId={p.id} status={p.status}/></div></article>; })}</div>
    {!rows.length && <div className="admin-empty">No listings match your filters.</div>}</div></section></main></div>;
}

export async function AdminNav({ isOwner }: { active?: string; isOwner?: boolean }) {
  const { user } = isOwner === undefined ? await requireAdmin() : { user: null };
  const showStaff = isOwner ?? user?.role === "owner";
  const items = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Tags },
    { label: "Shared options", href: "/admin/options", icon: SlidersHorizontal },
    { label: "Activity", href: "/admin/activity", icon: History },
    ...(showStaff ? [{ label: "Staff", href: "/admin/staff", icon: Users }] : []),
  ];
  return <aside className="admin-sidebar"><Link href="/admin" className="admin-sidebar-logo" aria-label="Mighty’s Home Finds admin overview"><Image src="/assets/brand/mightys-home-finds-logo.png" alt="Mighty’s Home Finds — Home and Living Essentials" width={2172} height={724} priority/><span>CATALOGUE ADMIN</span></Link><span className="admin-nav-heading">WORKSPACE</span><nav aria-label="Admin sections">{items.map(({ label, href, icon: Icon }) => <AdminNavLink key={href} href={href} label={label} icon={<Icon size={18} strokeWidth={1.9} aria-hidden="true"/>}/>)}<form action={signOutAction} className="admin-mobile-logout"><button><LogOut size={18} aria-hidden="true"/><span>Sign out</span></button></form></nav><form action={signOutAction} className="admin-signout"><button><LogOut size={17} aria-hidden="true"/> Sign out</button></form></aside>;
}

export async function AdminHeaderBrand() {
  const { user } = await requireAdmin();
  return <div className="admin-topbar-end"><Link href="/admin" className="admin-header-logo" aria-label="Mighty’s Home Finds admin overview"><Image src="/assets/brand/mightys-home-finds-logo.png" alt="Mighty’s Home Finds — Home and Living Essentials" width={2172} height={724}/></Link>{user&&<div className="admin-user"><span className="admin-user-avatar" aria-hidden="true">{(user.displayName || user.email || "S").charAt(0).toUpperCase()}</span><span className="admin-user-details"><span className="admin-user-name">{user.displayName || user.email}</span><span>{user.role === "owner" ? "Owner" : "Catalogue admin"}</span></span></div>}</div>;
}
