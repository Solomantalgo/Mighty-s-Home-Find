import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackagePlus, Package, FilePenLine, Tags } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { AdminHeaderBrand, AdminNav } from "@/app/admin/products/page";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const { supabase, user, error } = await requireAdmin();
  if (!user || !supabase) redirect("/admin/login");
  const [{ count: productsCount }, { count: draftsCount }, { count: categoryCount }, { data: recent }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id,name,status,updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);
  return <div className="admin-shell">
    <AdminNav active="Overview" isOwner={user.role === "owner"}/>
    <main className="admin-main">
      <header className="admin-topbar"><div><span className="admin-kicker">CATALOGUE</span><h1>Overview</h1></div><div className="admin-topbar-end"><AdminHeaderBrand/></div></header>
      <section className="admin-content"><div className="admin-welcome"><div><span className="admin-kicker">YOUR SHOP, AT A GLANCE</span><h2>Good to see you.</h2><p>Manage the designs and options your customers can actually buy.</p></div><Link className="admin-primary admin-link-button" href="/admin/products/new"><PackagePlus size={17}/> Add a product</Link></div>
        {error && <div className="admin-alert">{error}</div>}
        <div className="admin-stat-grid"><article><span className="admin-stat-icon"><Package size={19}/></span><span>Published listings</span><strong>{productsCount ?? 0}</strong><small>Visible to shoppers</small></article><article><span className="admin-stat-icon"><FilePenLine size={19}/></span><span>Draft listings</span><strong>{draftsCount ?? 0}</strong><small>Not visible to shoppers</small></article><article><span className="admin-stat-icon"><Tags size={19}/></span><span>Categories</span><strong>{categoryCount ?? 0}</strong><small>Manage your product groups</small></article></div>
        <section className="admin-panel"><div className="admin-panel-head"><div><h2>Recently updated</h2><p>Latest catalogue changes</p></div><Link href="/admin/products">All products <ArrowRight size={15}/></Link></div>{recent?.length ? <div className="admin-recent-list">{recent.map((product) => <Link key={product.id} href={`/admin/products/${product.id}`}><span><b>{product.name}</b><small>{new Date(product.updated_at).toLocaleDateString()}</small></span><em className={`status-pill status-${product.status}`}>{product.status}</em></Link>)}</div> : <div className="admin-empty"><PackagePlus size={22}/><b>No catalogue listings yet</b><span>Add the products and images your team has confirmed.</span><Link href="/admin/products/new">Create your first listing <ArrowRight size={14}/></Link></div>}</section>
      </section>
    </main>
  </div>;
}
