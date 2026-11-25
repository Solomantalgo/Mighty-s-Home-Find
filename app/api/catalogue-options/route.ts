import { getCatalogueOptions } from "@/lib/catalogue-options";

export async function GET() {
  const { sizes } = await getCatalogueOptions();
  return Response.json({ sizes }, { headers: { "Cache-Control": "no-store" } });
}
