import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { getCatalogueOptions } from "@/lib/catalogue-options";
import { AdminNav, AdminHeaderBrand } from "@/app/admin/products/page";
import { PublicationActions } from "@/app/admin/forms";

export const dynamic = "force-dynamic";
export default async function ProductReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await requireAdmin(); if (!user || !supabase) redirect("/admin/login");
  const { id } = await params;
  const [{ data: product }, { data: variants }, { data: images }, options] = await Promise.all([
    supabase.from("products").select("id,name,status,category_id").eq("id", id).maybeSingle(),
    supabase.from("variants").select("id,design,size,colour,is_active").eq("product_id", id),
    supabase.from("product_images").select("id,is_primary").eq("product_id", id),
    getCatalogueOptions(),
  ]);
  if (!product) notFound();
  const active = (variants ?? []).filter((variant) => variant.is_active);
  const { data: assets } = active.length ? await supabase.from("configurator_assets").select("variant_id,view,match_confirmed,is_active").in("variant_id", active.map((variant) => variant.id)) : { data: [] };
  const matched = new Set((assets ?? []).filter((asset) => asset.is_active && asset.match_confirmed).map((asset) => `${asset.variant_id}:${asset.view}`));
  const incomplete = active.filter((variant) => !matched.has(`${variant.id}:frame`) || !matched.has(`${variant.id}:dressed`));
  const ready = !!product.name && !!product.category_id && !!images?.some((image) => image.is_primary) && active.length > 0 && incomplete.length === 0 && options.sizes.length > 0;
  return <div className="admin-shell"><AdminNav active="Products"/><main className="admin-main"><header className="admin-topbar"><div><Link className="admin-back-link" href={`/admin/products/${id}/images`}><ChevronLeft size={15}/> Images</Link><h1>Review · {product.name}</h1></div><AdminHeaderBrand/></header><section className="admin-content admin-editor-content"><nav className="admin-editor-steps" aria-label="Listing steps"><Link href={`/admin/products/${id}`}>1. Details</Link><Link href={`/admin/products/${id}/images`}>2. Images</Link><strong aria-current="step">3. Review &amp; publish</strong></nav>
    <section className="admin-form-card"><div className="admin-form-section-head"><span>03</span><div><h2>Ready to publish?</h2><p>Publishing makes this listing visible on the storefront.</p></div></div><ul className="admin-review-list"><li>{product.name && product.category_id ? "✓ Name and category saved" : "Name and category missing"}</li><li>{images?.some((image) => image.is_primary) ? "✓ Main listing photo added" : "Add a main listing photo"}</li><li>{active.length ? `✓ ${active.length} design and colour image set${active.length === 1 ? "" : "s"}` : "Add at least one design and colour image set"}</li><li>{incomplete.length ? `${incomplete.length} image set${incomplete.length === 1 ? " needs" : "s need"} matching frame and dressed photos` : active.length ? "✓ Every image set has a matched pair" : "Matched image pairs needed"}</li><li>All beds use the same {options.sizes.length} checkout sizes and shared prices. <Link href="/admin/options">Edit shared prices</Link></li></ul>{!ready && <p className="admin-alert">Complete the missing items on the images step before publishing. <Link href={`/admin/products/${id}/images`}>Go to images</Link></p>}<PublicationActions productId={id} status={product.status}/></section>
  </section></main></div>;
}
