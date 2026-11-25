import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { AdminNav, AdminHeaderBrand } from "@/app/admin/products/page";
import { ListingDetailsForm } from "@/app/admin/products/listing-step-forms";
import { getCatalogueOptions } from "@/lib/catalogue-options";

export const dynamic = "force-dynamic";
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await requireAdmin(); if (!user || !supabase) redirect("/admin/login");
  const { id } = await params;
  const [{ data: product }, { data: categories }, { data: primaryVariant }, options] = await Promise.all([
    supabase.from("products").select("id,name,category_id,model_name,description,material,care,included,delivery_note,status").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id,name").order("display_order"),
    supabase.from("variants").select("colour").eq("product_id", id).eq("is_active", true).order("created_at").limit(1).maybeSingle(),
    getCatalogueOptions(),
  ]);
  if (!product) notFound();
  return <div className="admin-shell"><AdminNav active="Products"/><main className="admin-main"><header className="admin-topbar"><div><Link className="admin-back-link" href="/admin/products"><ChevronLeft size={15}/> Products</Link><h1>Edit listing</h1></div><div className="admin-topbar-end"><AdminHeaderBrand/><span className={`status-pill status-${product.status}`}>{product.status}</span></div></header><section className="admin-content admin-editor-content"><nav className="admin-editor-steps" aria-label="Listing steps"><strong aria-current="step">1. Details</strong><Link href={`/admin/products/${id}/images`}>2. Images</Link><Link href={`/admin/products/${id}/review`}>3. Review &amp; publish</Link></nav><ListingDetailsForm categories={categories ?? []} options={options} product={product} primaryColour={primaryVariant?.colour}/></section></main></div>;
}
