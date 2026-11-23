import {
  getCatalogVariantImage,
  type BedDesignId,
  type FinishId,
} from "@/lib/bed-color-variants";

export type Finish = { id: FinishId; name: string; hex: string };
export type BedProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  rating: string;
  reviews: number;
  description: string;
  frame: string;
  dressed: string;
  image: string;
  configuratorDesign: BedDesignId;
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

// All customer-facing product and commercial details in this file are sample content.
export const sampleFinishes: Finish[] = [
  { id: "matte-black", name: "Matte Black", hex: "#242522" },
  { id: "white", name: "White", hex: "#e9e5dd" },
  { id: "graphite-grey", name: "Graphite Grey", hex: "#777976" },
  { id: "antique-bronze", name: "Antique Bronze", hex: "#8a6448" },
  { id: "deep-navy", name: "Deep Navy", hex: "#283d53" },
];

export const products: BedProduct[] = [
  {
    id: "classic",
    slug: "classic-spindle",
    name: "Classic Spindle Metallic Bed",
    shortName: "Classic Spindle",
    category: "King Beds",
    rating: "4.8",
    reviews: 56,
    description: "A timeless vertical-rail silhouette with clean, airy lines.",
    frame: getCatalogVariantImage("classic-spindle", "matte-black", "frame"),
    dressed: getCatalogVariantImage("classic-spindle", "matte-black", "dressed"),
    image: getCatalogVariantImage("classic-spindle", "matte-black", "dressed"),
    configuratorDesign: "classic-spindle",
    colorName: "Matte Black",
    finishes: sampleFinishes,
    delivery: "2\u20134 days",
    included: "Frame only. Mattress and bedding are shown for styling.",
    material: "Metal frame \u00B7 sample details",
    care: "Sample care information",
    alt: "Classic spindle bed frame shown with sample bedding",
  },
  {
    id: "queen",
    slug: "square-grid",
    name: "Square Grid Metallic Bed",
    shortName: "Square Grid",
    category: "Queen Beds",
    rating: "4.9",
    reviews: 32,
    description: "A geometric grid profile with a neat, contemporary look.",
    frame: getCatalogVariantImage("square-grid", "white", "frame"),
    dressed: getCatalogVariantImage("square-grid", "white", "dressed"),
    image: getCatalogVariantImage("square-grid", "white", "dressed"),
    configuratorDesign: "square-grid",
    colorName: "White",
    finishes: sampleFinishes,
    delivery: "2\u20134 days",
    included: "Frame only. Mattress and bedding are shown for styling.",
    material: "Metal frame \u00B7 sample details",
    care: "Sample care information",
    alt: "Square grid bed frame shown with sample bedding",
  },
  {
    id: "bunk",
    slug: "arched-rail",
    name: "Arched Rail Metallic Bed",
    shortName: "Arched Rail",
    category: "Double Beds",
    rating: "4.8",
    reviews: 41,
    description: "Softly curved rails bring a graceful touch to this sample design.",
    frame: getCatalogVariantImage("arched-rail", "matte-black", "frame"),
    dressed: getCatalogVariantImage("arched-rail", "matte-black", "dressed"),
    image: getCatalogVariantImage("arched-rail", "matte-black", "dressed"),
    configuratorDesign: "arched-rail",
    colorName: "Matte Black",
    finishes: sampleFinishes,
    delivery: "2\u20134 days",
    included: "Frame only. Mattress and bedding are shown for styling.",
    material: "Metal frame \u00B7 sample details",
    care: "Sample care information",
    alt: "Arched rail bed frame shown with sample bedding",
  },
  {
    id: "double-lowline",
    slug: "double-lowline",
    name: "Lowline Platform Double Bed",
    shortName: "Lowline Platform",
    category: "Double Beds",
    rating: "4.8",
    reviews: 24,
    description: "A low, broad horizontal-rail frame with a distinct profile.",
    frame: getCatalogVariantImage("double-lowline", "matte-black", "frame"),
    dressed: getCatalogVariantImage("double-lowline", "matte-black", "dressed"),
    image: getCatalogVariantImage("double-lowline", "matte-black", "dressed"),
    configuratorDesign: "double-lowline",
    colorName: "Matte Black",
    finishes: sampleFinishes,
    delivery: "2\u20134 days",
    included: "Frame only. Mattress and bedding are shown for styling.",
    material: "Metal frame \u00B7 sample details",
    care: "Sample care information",
    alt: "Lowline platform double bed with broad horizontal metal rails",
  },
];

export const categories = [
  {
    slug: "king-beds",
    name: "King Beds",
    chipLabel: "King Beds",
    href: "/products/classic-spindle?category=king-beds",
    modelIds: ["classic"],
    defaultProductId: "classic",
    modelHeading: "King Bed Models",
    image: "/assets/category-media/king-beds.png",
    alternateImage: "/assets/category-media/king-beds-2.png",
    alt: "Generated adult king bed category concept",
  },
  {
    slug: "queen-beds",
    name: "Queen Beds",
    chipLabel: "Queen Beds",
    href: "/products/square-grid?category=queen-beds",
    modelIds: ["queen"],
    defaultProductId: "queen",
    modelHeading: "Queen Bed Models",
    image: "/assets/category-media/queen-beds.png",
    alternateImage: "/assets/category-media/queen-beds-2.png",
    alt: "Generated adult queen bed category concept",
  },
  {
    slug: "double-beds",
    name: "Double Beds",
    chipLabel: "Double Beds",
    href: "/products/double-lowline?category=double-beds",
    modelIds: ["double-lowline", "bunk"],
    defaultProductId: "double-lowline",
    modelHeading: "Double Bed Models",
    image: "/assets/category-media/double-beds-1.png",
    alternateImage: "/assets/category-media/double-beds-2.png",
    alt: "Generated adult double bed category concept",
  },
  {
    slug: "triple-beds",
    name: "Triple Beds",
    chipLabel: "Triple Beds",
    href: "/products/classic-spindle?category=triple-beds",
    modelIds: [],
    defaultProductId: "classic",
    modelHeading: "Triple Bed Models",
    image: "/assets/category-media/triple-beds-1.png",
    alternateImage: "/assets/category-media/triple-beds-2.png",
    alt: "Generated triple-bed concept image; illustrative only",
  },
  {
    slug: "kids-beds",
    name: "Kids\u2019 Beds",
    chipLabel: "Kids\u2019 Beds",
    href: "/products/classic-spindle?category=kids-beds",
    modelIds: [],
    defaultProductId: "classic",
    modelHeading: "Kids\u2019 Bed Models",
    image: "/assets/category-media/kids-beds.png",
    alternateImage: "/assets/category-media/kids-beds-2.png",
    alt: "Generated child-sized bed category concept",
  },
  {
    slug: "bunk-beds",
    name: "Bunk Beds",
    chipLabel: "Bunk Beds",
    href: "/products/classic-spindle?category=bunk-beds",
    modelIds: [],
    defaultProductId: "classic",
    modelHeading: "Bunk Bed Models",
    image: "/assets/category-media/bunk-beds.png",
    alternateImage: "/assets/category-media/bunk-beds-2.png",
    alt: "Generated two-level bunk bed category concept",
  },
] as const;

export const benefits = [
  { icon: "truck", title: "Delivery", detail: "2\u20134 days" },
  { icon: "shield", title: "Strong & Durable", detail: "Metal frame" },
  { icon: "tag", title: "Great Value", detail: "Sample prices" },
  { icon: "support", title: "Friendly Support", detail: "We\u2019re here to help" },
];

export const sampleReview = {
  quote: "The bed is strong, stylish and very comfortable. Delivery was quick and smooth!",
  author: "Sample customer",
  stars: 5,
};

export const formatUGX = (amount: number) =>
  `UGX ${amount.toLocaleString("en-UG")}`;
