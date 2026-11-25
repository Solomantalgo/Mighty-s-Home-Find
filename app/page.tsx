import HomePageClient from "./home-page-client";

// Keep the root HTML fresh across Passenger deployments. Static route output on
// cPanel was being served with an outdated CSS chunk reference after releases.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return <HomePageClient />;
}
