import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bedMeasurements } from "@/lib/sample-data";

export type SharedSize = { id: string; label: string; price: number };
export type CatalogueOptions = { sizes: SharedSize[]; designs: string[]; colours: string[] };

export const fallbackOptions: CatalogueOptions = {
  sizes: bedMeasurements.map((size) => ({ ...size })),
  designs: ["Classic spindle", "Modern minimal", "Floral scroll", "Heavy duty", "Bunk frame", "Triple decker"],
  colours: ["Matte Black", "White", "Graphite Grey", "Antique Bronze", "Deep Navy"],
};

export async function getCatalogueOptions(): Promise<CatalogueOptions> {
  const db = await createSupabaseServerClient();
  if (!db) return fallbackOptions;
  const { data, error } = await db.from("catalogue_options").select("sizes,designs,colours").eq("id", 1).maybeSingle();
  if (error || !data) return fallbackOptions;
  const sizes = Array.isArray(data.sizes) ? data.sizes.filter((s: unknown): s is SharedSize =>
    !!s && typeof s === "object" && typeof (s as SharedSize).id === "string" &&
    typeof (s as SharedSize).label === "string" && Number.isSafeInteger((s as SharedSize).price) && (s as SharedSize).price > 0) : [];
  const strings = (values: unknown) => Array.isArray(values) ? values.filter((v): v is string => typeof v === "string" && v.trim().length > 0) : [];
  return {
    sizes: sizes.length ? sizes : fallbackOptions.sizes,
    designs: strings(data.designs).length ? strings(data.designs) : fallbackOptions.designs,
    colours: strings(data.colours).length ? strings(data.colours) : fallbackOptions.colours,
  };
}
