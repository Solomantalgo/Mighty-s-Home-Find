import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { AdminNav, AdminHeaderBrand } from "@/app/admin/products/page";
import { ListingDetailsForm } from "@/app/admin/products/listing-step-forms";
import { getCatalogueOptions } from "@/lib/catalogue-options";

export const dynamic = "force-dynamic";
export default async function NewProductPage() {
  const { supabase, user } = await requireAdmin(); if (!user || !supabase) redirect("/admin/login");
  const [{ data: categories }, options] = await Promise.all([supabase.from("categories").select("id,name").order("display_order"), getCatalogueOptions()]);
  return <div className="admin-shell"><AdminNav active="Products"/><main className="admin-main"><header className="admin-topbar"><div><Link className="admin-back-link" href="/admin/products"><ChevronLeft size={15}/> Products</Link><h1>Add a bed</h1></div><AdminHeaderBrand/></header><section className="admin-content admin-editor-content"><nav className="admin-editor-steps" aria-label="Listing steps"><strong aria-current="step">1. Details</strong><span>2. Images</span><span>3. Review &amp; publish</span></nav>{!categories?.length && <div className="admin-alert">Create a category before adding a listing. <Link href="/admin/categories">Manage categories</Link></div>}<ListingDetailsForm categories={categories ?? []} options={options}/></section></main></div>;
}
