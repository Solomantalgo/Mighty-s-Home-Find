import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/server";
import { AdminNav, AdminHeaderBrand } from "@/app/admin/products/page";
import { CategoryForm } from "@/app/admin/forms";

export const dynamic = "force-dynamic";
export default async function CategoriesPage() {
  const { supabase, user } = await requireAdmin();
  if (!user || !supabase) redirect("/admin/login");
  const { data: categories } = await supabase.from("categories").select("*").order("display_order");
  return <div className="admin-shell"><AdminNav active="Categories"/><main className="admin-main"><header className="admin-topbar"><div><span className="admin-kicker">CATALOGUE</span><h1>Categories</h1></div><AdminHeaderBrand/></header><section className="admin-content admin-editor-content">
    <div className="admin-section-title"><div><h2>Existing categories</h2><p className="admin-muted">Manage the groups shoppers see in the catalogue.</p></div></div>
    <div className="admin-category-list">{categories?.map((category) => <details className="admin-category-edit" key={category.id}><summary><b>{category.name}</b><span>/{category.slug}</span><em className={`status-pill ${category.is_published ? "status-published" : "status-draft"}`}>{category.is_published ? "Visible" : "Hidden"}</em><strong className="admin-category-edit-action">Edit</strong></summary><CategoryForm category={category}/></details>)}{!categories?.length && <div className="admin-panel admin-empty">No categories yet. Add one to organise your products.</div>}</div>
    <details className="admin-category-create"><summary className="admin-primary">+ Add category</summary><CategoryForm/></details>
  </section></main></div>;
}
