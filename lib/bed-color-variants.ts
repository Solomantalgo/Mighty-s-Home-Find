import catalog from "@/lib/generated-bed-image-index.json";

export type FinishId = "matte-black" | "white" | "graphite-grey" | "antique-bronze" | "deep-navy";
export type BedImageState = "frame" | "dressed";

export type CatalogImagePair = {
  category: string;
  categoryName: string;
  design: string;
  imageSize: string;
  finish: FinishId;
  frame: string;
  dressed: string;
  width: number;
  height: number;
};

export type CatalogDesign = {
  id: string;
  category: string;
  design: string;
  name: string;
  pairs: CatalogImagePair[];
  imageSizes: string[];
  finishes: FinishId[];
};

const pairs = catalog.pairs as CatalogImagePair[];
export const catalogImagePairs = pairs;

export const catalogDesigns: CatalogDesign[] = [...new Set(pairs.map((pair) => `${pair.category}:${pair.design}`))]
  .map((key) => {
    const [category, design] = key.split(":");
    const designPairs = pairs.filter((pair) => pair.category === category && pair.design === design);
    const label = design.replace("design-", "Design ");
    return {
      id: `${category}-${design}`,
      category,
      design,
      name: label,
      pairs: designPairs,
      imageSizes: [...new Set(designPairs.map((pair) => pair.imageSize))],
      finishes: [...new Set(designPairs.map((pair) => pair.finish))],
    };
  });

export function getCatalogVariantImage(
  designId: string,
  imageSize: string,
  finish: FinishId,
  state: BedImageState,
) {
  const design = catalogDesigns.find((item) => item.id === designId);
  const pair = design?.pairs.find((item) => item.imageSize === imageSize && item.finish === finish);
  if (!pair) throw new Error(`No matched ${state} image for ${designId}/${imageSize}/${finish}`);
  return pair[state];
}
