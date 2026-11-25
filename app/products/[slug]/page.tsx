import { notFound } from "next/navigation";
import { ProductExperience } from "@/components/product-experience";
import { getStorefrontCatalog } from "@/lib/storefront-catalog";
import { getCatalogueOptions } from "@/lib/catalogue-options";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ category?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [catalog, options] = await Promise.all([getStorefrontCatalog(), getCatalogueOptions()]);
  const productList = catalog.products;
  const categoryList = catalog.categories;
  const product = productList.find((item) => item.slug === slug);
  if (!product) notFound();
  const category = categoryList.find((item) => item.slug === query.category) ?? categoryList.find((item) => item.slug === product.categorySlug) ?? categoryList[0];
  if (!category) notFound();
  const backHref = category.href;
  return <ProductExperience product={product} backHref={backHref} categorySlug={category.slug} catalogProducts={productList} catalogCategories={categoryList} sharedSizes={options.sizes}/>;
}
