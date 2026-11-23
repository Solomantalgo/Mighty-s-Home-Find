import { notFound } from "next/navigation";
import { ProductExperience } from "@/components/product-experience";
import { categories, products } from "@/lib/sample-data";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ category?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  const category = categories.find((item) => item.slug === query.category) ?? categories.find((item) => item.name === product.category) ?? categories[1];
  const backHref = category.href;
  return <ProductExperience product={product} backHref={backHref} categorySlug={category.slug}/>;
}
