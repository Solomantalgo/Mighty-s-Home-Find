import { redirect } from "next/navigation";
import { AdminHeaderBrand, AdminNav } from "@/app/admin/products/page";
import { requireAdmin } from "@/lib/supabase/server";
import { getCatalogueOptions } from "@/lib/catalogue-options";
import { OptionsForm } from "./options-form";

export const dynamic = "force-dynamic";
export default async function CatalogueOptionsPage() {
  const [{ user }, options] = await Promise.all([requireAdmin(), getCatalogueOptions()]);
  if (!user) redirect("/admin/login");
  return <div className="admin-shell"><AdminNav active="Options"/><main className="admin-main"><header className="admin-topbar"><div><span className="admin-kicker">CATALOGUE</span><h1>Shared options</h1></div><AdminHeaderBrand/></header><section className="admin-content admin-editor-content"><p>Set the sizes, prices, designs and colours used across the catalogue.</p><OptionsForm options={options}/></section></main></div>;
}
