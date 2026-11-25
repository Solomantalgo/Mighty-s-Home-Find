import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { getCatalogueOptions } from "@/lib/catalogue-options";
import { AdminNav, AdminHeaderBrand } from "@/app/admin/products/page";
import { AddImageSetForm } from "@/app/admin/products/listing-step-forms";
import { ConfiguratorImageUpload, ProductImageControls, ProductImageUpload, RemoveImageSetForm } from "@/app/admin/forms";

export const dynamic = "force-dynamic";
export default async function ProductImagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await requireAdmin(); if (!user || !supabase) redirect("/admin/login");
  const { id } = await params;
  const [{ data: product }, { data: variants }, { data: images }, options] = await Promise.all([
    supabase.from("products").select("id,name,status").eq("id", id).maybeSingle(),
    supabase.from("variants").select("id,design,size,colour,is_active").eq("product_id", id).order("created_at"),
    supabase.from("product_images").select("id,image_url,alt_text,is_primary").eq("product_id", id).order("display_order"),
    getCatalogueOptions(),
  ]);
  if (!product) notFound();
  const active = (variants ?? []).filter((variant) => variant.is_active);
  const { data: assets } = active.length ? await supabase.from("configurator_assets").select("variant_id,view,image_url,alt_text,match_confirmed").in("variant_id", active.map((variant) => variant.id)).eq("is_active", true) : { data: [] };
  const imageByVariant = new Map((assets ?? []).map((asset) => [`${asset.variant_id}:${asset.view}`, asset]));
  return <div className="admin-shell"><AdminNav active="Products"/><main className="admin-main"><header className="admin-topbar"><div><Link className="admin-back-link" href={`/admin/products/${id}`}><ChevronLeft size={15}/> Details</Link><h1>Images · {product.name}</h1></div><AdminHeaderBrand/></header><section className="admin-content admin-editor-content"><nav className="admin-editor-steps" aria-label="Listing steps"><Link href={`/admin/products/${id}`}>1. Details</Link><strong aria-current="step">2. Images</strong><Link href={`/admin/products/${id}/review`}>3. Review &amp; publish</Link></nav>
    <section className="admin-form-card"><div className="admin-form-section-head"><span>02</span><div><h2>Listing photos</h2><p>Add the main photo shoppers will see. The first upload becomes the primary image.</p></div></div><ProductImageUpload productId={id}/><div className="admin-gallery">{images?.map((image) => <figure key={image.id}><Image unoptimized width={500} height={300} src={image.image_url} alt={image.alt_text}/><figcaption>{image.alt_text}{image.is_primary ? " · Primary" : ""}</figcaption><ProductImageControls productId={id} imageId={image.id} isPrimary={image.is_primary}/></figure>)}</div>{!images?.length && <p className="admin-muted">No listing photo yet.</p>}</section>
    {product.status === "published" ? <p className="admin-alert">To add or remove image sets, <Link href={`/admin/products/${id}/review`}>unpublish this listing</Link> first. You can replace an existing photo here.</p> : <AddImageSetForm productId={id} options={options}/>}
    <section className="admin-pair-list">{active.map((variant) => <article key={variant.id} className="admin-form-card admin-pair-card"><div className="admin-pair-heading"><b>{variant.design}</b><span>{variant.colour}</span>{product.status !== "published" && <RemoveImageSetForm productId={id} variantId={variant.id}/>}</div><div className="admin-pair-grid"><ConfiguratorImageUpload variantId={variant.id} view="frame" current={imageByVariant.get(`${variant.id}:frame`)}/><ConfiguratorImageUpload variantId={variant.id} view="dressed" current={imageByVariant.get(`${variant.id}:dressed`)}/></div></article>)}{!active.length && <p className="admin-muted">Add a design and colour above to upload its matching images.</p>}</section>
    <div className="admin-form-actions"><Link className="admin-primary admin-link-button" href={`/admin/products/${id}/review`}>Continue to review</Link></div>
  </section></main></div>;
}
