import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { products as sampleProducts, categories as sampleCategories, type BedProduct, type BedImageSize, type Finish } from "@/lib/sample-data";

const finishDetails: Record<string, Finish> = {
  "matte-black": { id: "matte-black", name: "Matte Black", hex: "#242522" },
  white: { id: "white", name: "White", hex: "#e9e5dd" },
  "graphite-grey": { id: "graphite-grey", name: "Graphite Grey", hex: "#777976" },
  "antique-bronze": { id: "antique-bronze", name: "Antique Bronze", hex: "#8a6448" },
  "deep-navy": { id: "deep-navy", name: "Deep Navy", hex: "#283d53" },
};
const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sampleFinish = (value: string) => finishDetails[key(value)] ?? { id: key(value) || "custom-finish", name: value, hex: "#777777" };

export async function getStorefrontCatalog() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { products: sampleProducts, categories: sampleCategories, managed: false };
  const [{ data: categoryRows, error: categoryError }, { data: productRows, error: productError }, { data: options }] = await Promise.all([
    supabase.from("categories").select("id,name,slug,description,display_order").eq("is_published", true).order("display_order"),
    supabase.from("products").select("id,name,slug,model_name,short_description,description,material,care,included,delivery_note,category_id,categories(name,slug)").eq("status", "published").order("updated_at", { ascending: false }),
    supabase.from("catalogue_options").select("managed_catalogue_live").eq("id", 1).maybeSingle(),
  ]);
  if (categoryError || productError || !categoryRows || !productRows) throw new Error("The managed catalogue is temporarily unavailable.");
  if (!productRows.length && !options?.managed_catalogue_live) return { products: sampleProducts, categories: sampleCategories, managed: false };
  if (!categoryRows.length || !productRows.length) return { products: [], categories: [], managed: true };
  const productIds = productRows.map((product) => product.id);
  const [{ data: variants }, { data: gallery }] = await Promise.all([
    supabase.from("variants").select("id,product_id,design,size,colour,sku").in("product_id", productIds).eq("is_active", true).order("created_at", { ascending: true }),
    supabase.from("product_images").select("product_id,image_url,alt_text,display_order,is_primary").in("product_id", productIds).order("display_order"),
  ]);
  const variantRows = variants ?? [];
  const { data: assets } = variantRows.length
    ? await supabase.from("configurator_assets").select("variant_id,view,image_url,alt_text,match_confirmed").in("variant_id", variantRows.map((variant) => variant.id)).eq("is_active", true)
    : { data: [] };
  const assetsByVariant = new Map<string, { frame?: string; dressed?: string }>();
  for (const asset of assets ?? []) {
    if (!asset.match_confirmed) continue;
    const pair = assetsByVariant.get(asset.variant_id) ?? {};
    if (asset.view === "frame") pair.frame = asset.image_url;
    if (asset.view === "dressed") pair.dressed = asset.image_url;
    assetsByVariant.set(asset.variant_id, pair);
  }
  const resolvedCategories = categoryRows.map((category) => {
    const items = productRows.filter((product) => product.category_id === category.id);
    const first = items[0];
    const firstVariant = variantRows.find((variant) => variant.product_id === first?.id);
    const pair = firstVariant ? assetsByVariant.get(firstVariant.id) : undefined;
    const image = (gallery ?? []).find((item) => item.product_id === first?.id && item.is_primary) ?? (gallery ?? []).find((item) => item.product_id === first?.id);
    return { slug: category.slug, name: category.name, chipLabel: category.name, modelHeading: `${category.name} Models`, image: image?.image_url ?? pair?.dressed ?? "/assets/homefinds-bedroom-hero.png", alternateImage: image?.image_url ?? pair?.dressed ?? "/assets/homefinds-bedroom-hero.png", alt: image?.alt_text ?? `${category.name} bed`, concept: false, href: first ? `/products/${first.slug}?category=${category.slug}` : "#shop", modelIds: items.map((item) => item.id), defaultProductId: first?.id ?? "" };
  });
  const resolvedProducts: BedProduct[] = productRows.flatMap((row) => {
    const relatedCategory = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    const category = resolvedCategories.find((item) => item.slug === (relatedCategory as { slug: string } | null)?.slug);
    const rowVariants = variantRows.filter((variant) => variant.product_id === row.id);
    const saleVariants = rowVariants.flatMap((variant) => {
      const pair = assetsByVariant.get(variant.id);
      return pair?.frame && pair.dressed ? [{ id: variant.id, design: variant.design, size: variant.size, colour: variant.colour, sku: variant.sku, frameImage: pair.frame, dressedImage: pair.dressed }] : [];
    });
    const primary = (gallery ?? []).find((image) => image.product_id === row.id && image.is_primary) ?? (gallery ?? []).find((image) => image.product_id === row.id);
    if (!category || !primary || !saleVariants.length) return [];
    const finishes = [...new Map(saleVariants.map((variant) => { const color = sampleFinish(variant.colour); return [color.id, color] as const; })).values()];
    const sizes = [...new Map<string, BedImageSize>(saleVariants.map((variant) => [key(variant.size), { id: key(variant.size), label: variant.size, finishes: [...new Set(saleVariants.filter((entry) => key(entry.size) === key(variant.size)).map((entry) => sampleFinish(entry.colour).id))] }] as [string, BedImageSize])).values()];
    saleVariants.sort((a, b) => Number(b.dressedImage === primary.image_url) - Number(a.dressedImage === primary.image_url));
    const defaultVariant = saleVariants[0];
    const finish = sampleFinish(defaultVariant.colour);
    const modelName = row.model_name || row.name;
    return [{ id: row.id, slug: row.slug, name: row.name, shortName: modelName, category: category.name, categorySlug: category.slug, rating: "", reviews: 0, description: row.description || row.short_description || row.name, frame: defaultVariant.frameImage, dressed: defaultVariant.dressedImage, image: primary.image_url, configuratorDesign: row.id, defaultImageSize: key(defaultVariant.size), previewSizes: sizes, colorName: finish.name, finishes, delivery: row.delivery_note || "Contact us to confirm delivery", included: row.included || row.short_description || "See the listing details for product information.", material: row.material || "Contact us for material details.", care: row.care || "Contact us for care guidance.", alt: primary.alt_text || row.name, managed: true, saleVariants }];
  });
  if (!resolvedProducts.length) return { products: [], categories: [], managed: true };
  const visibleCategories = resolvedCategories.flatMap((category) => {
    const items = resolvedProducts.filter((product) => product.categorySlug === category.slug);
    if (!items.length) return [];
    return [{ ...category, href: `/products/${items[0].slug}?category=${category.slug}`, modelIds: items.map((item) => item.id), defaultProductId: items[0].id }];
  });
  return { products: resolvedProducts, categories: visibleCategories, managed: true };
}
