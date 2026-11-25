import { catalogDesigns, getCatalogVariantImage, type FinishId } from "@/lib/bed-color-variants";

export type Finish = { id: FinishId; name: string; hex: string };
export type BedImageSize = { id: string; label: string; finishes: FinishId[] };
export type BedProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  categorySlug: string;
  rating: string;
  reviews: number;
  description: string;
  frame: string;
  dressed: string;
  image: string;
  configuratorDesign: string;
  defaultImageSize: string;
  previewSizes: BedImageSize[];
  colorName: string;
  finishes: Finish[];
  delivery: string;
  included: string;
  material: string;
  care: string;
  alt: string;
};

export const bedMeasurements = [
  { id: "4x6", label: "4\u00D76", price: 600000 },
  { id: "5x6", label: "5\u00D76", price: 700000 },
  { id: "6x6", label: "6\u00D76", price: 800000 },
] as const;
export type BedMeasurementId = (typeof bedMeasurements)[number]["id"];
export const DEFAULT_BED_MEASUREMENT: BedMeasurementId = "5x6";
export const bedMeasurementPrice = (id: BedMeasurementId) =>
  bedMeasurements.find((item) => item.id === id)?.price ?? bedMeasurements[1].price;

// Commercial copy and amounts below are illustrative sample data. Image-size
// tokens from generated filenames are kept separate from these measurements.
const finishDetails: Record<FinishId, Finish> = {
  "matte-black": { id: "matte-black", name: "Matte Black", hex: "#242522" },
  white: { id: "white", name: "White", hex: "#e9e5dd" },
  "graphite-grey": { id: "graphite-grey", name: "Graphite Grey", hex: "#777976" },
  "antique-bronze": { id: "antique-bronze", name: "Antique Bronze", hex: "#8a6448" },
  "deep-navy": { id: "deep-navy", name: "Deep Navy", hex: "#283d53" },
};

const categoryDefinitions = [
  { slug: "king-beds", name: "King Beds", chipLabel: "King Beds", modelHeading: "King Bed Models", image: "/assets/category-media/king-beds.png", alternateImage: "/assets/category-media/king-beds-2.png", alt: "Generated king bed category concept", concept: false },
  { slug: "queen-beds", name: "Queen Beds", chipLabel: "Queen Beds", modelHeading: "Queen Bed Models", image: "/assets/category-media/queen-beds.png", alternateImage: "/assets/category-media/queen-beds-2.png", alt: "Generated queen bed category concept", concept: false },
  { slug: "double-beds", name: "Double Beds", chipLabel: "Double Beds", modelHeading: "Double Bed Models", image: "/assets/category-media/double-beds-1.png", alternateImage: "/assets/category-media/double-beds-2.png", alt: "Generated double bed category concept", concept: false },
  { slug: "triple-beds", name: "Triple Beds", chipLabel: "Triple Beds", modelHeading: "Triple Bed Models", image: "/assets/category-media/triple-beds-1.png", alternateImage: "/assets/category-media/triple-beds-2.png", alt: "Generated triple-bed concept image; layout is illustrative", concept: true },
  { slug: "kids-beds", name: "Kids’ Beds", chipLabel: "Kids’ Beds", modelHeading: "Kids’ Bed Models", image: "/assets/category-media/kids-beds.png", alternateImage: "/assets/category-media/kids-beds-2.png", alt: "Generated child-sized bed category concept", concept: false },
  { slug: "bunk-beds", name: "Bunk Beds", chipLabel: "Bunk Beds", modelHeading: "Bunk Bed Models", image: "/assets/category-media/bunk-beds.png", alternateImage: "/assets/category-media/bunk-beds-2.png", alt: "Generated two-level bunk bed category concept", concept: false },
] as const;

const categoryNames = new Map<string, string>(categoryDefinitions.map((category) => [category.slug, category.name]));
const sizeLabel = (value: string) => value.split("-").map((part) => part.replace(/^./, (letter) => letter.toUpperCase())).join(" ");

export const products: BedProduct[] = catalogDesigns.map((design) => {
  const category = categoryDefinitions.find((item) => item.slug === design.category)!;
  const imageSizes: BedImageSize[] = design.imageSizes.map((id) => ({
    id,
    label: sizeLabel(id),
    finishes: design.pairs.filter((pair) => pair.imageSize === id).map((pair) => pair.finish),
  }));
  const defaultImageSize = imageSizes.find((size) => size.id === "standard")?.id ?? imageSizes[0].id;
  const defaultFinish = imageSizes.find((size) => size.id === defaultImageSize)?.finishes.includes("matte-black")
    ? "matte-black" : imageSizes.find((size) => size.id === defaultImageSize)!.finishes[0];
  const id = design.id;
  const frame = getCatalogVariantImage(id, defaultImageSize, defaultFinish, "frame");
  const dressed = getCatalogVariantImage(id, defaultImageSize, defaultFinish, "dressed");
  const name = `Bed Design ${design.design.replace("design-", "")}`;
  return {
    id,
    slug: id,
    name: `${category.name} ${name}`,
    shortName: name,
    category: categoryNames.get(design.category) ?? category.name,
    categorySlug: design.category,
    rating: "4.8",
    reviews: 24,
    description: `Generated ${category.name.toLowerCase()} design concept for previewing bed styles.`,
    frame,
    dressed,
    image: dressed,
    configuratorDesign: id,
    defaultImageSize,
    previewSizes: imageSizes,
    colorName: finishDetails[defaultFinish].name,
    finishes: [...new Set(design.pairs.map((pair) => pair.finish))].map((finish) => finishDetails[finish]),
    delivery: "2–4 days",
    included: "Generated product imagery is a concept preview.",
    material: "Sample product details",
    care: "Sample care information",
    alt: `${category.name}, ${design.design.replace("design-", "design ")}, ${sizeLabel(defaultImageSize)} generated bed image concept with sample bedding`,
  };
});

export const categories = categoryDefinitions.map((category) => {
  const modelProducts = products.filter((product) => product.categorySlug === category.slug);
  const defaultProduct = modelProducts[0];
  const categorySpecificImage = defaultProduct?.image ?? category.image;
  return {
    ...category,
    href: defaultProduct ? `/products/${defaultProduct.slug}?category=${category.slug}` : "#shop",
    modelIds: modelProducts.map((product) => product.id),
    defaultProductId: defaultProduct?.id ?? "",
    image: categorySpecificImage,
    alt: defaultProduct?.alt ?? category.alt,
  };
});

export const benefits = [
  { icon: "truck", title: "Delivery", detail: "2–4 days" },
  { icon: "shield", title: "Strong & Durable", detail: "Metal frame" },
  { icon: "tag", title: "Great Value", detail: "Sample prices" },
  { icon: "support", title: "Friendly Support", detail: "We’re here to help" },
];

export const sampleReview = {
  quote: "The bed is strong, stylish and very comfortable. Delivery was quick and smooth!",
  author: "Sample customer",
  stars: 5,
};

export const formatUGX = (amount: number) => `UGX ${amount.toLocaleString("en-UG")}`;
