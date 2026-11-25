import HomePageClient from "./home-page-client";
import { getStorefrontCatalog } from "@/lib/storefront-catalog";
import { getCatalogueOptions } from "@/lib/catalogue-options";

// Keep the root HTML fresh across Passenger deployments. Static route output on
// cPanel was being served with an outdated CSS chunk reference after releases.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [catalog, options] = await Promise.all([getStorefrontCatalog(), getCatalogueOptions()]);
  return <HomePageClient products={catalog.products} categories={catalog.categories} managed={catalog.managed} sharedSizes={options.sizes} />;
}
