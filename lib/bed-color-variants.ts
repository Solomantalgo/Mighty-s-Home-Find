export type BedDesignId = "classic-spindle" | "square-grid" | "arched-rail" | "double-lowline";
export type FinishId = "matte-black" | "white" | "graphite-grey" | "antique-bronze" | "deep-navy";
export type BedImageState = "frame" | "dressed";

/** Exact generated sample paths; every state and finish uses its corresponding image asset. */
export const bedCatalogVariants: Record<Exclude<BedDesignId, "double-lowline">, Record<FinishId, Record<BedImageState, string>>> = {
  "classic-spindle": {
    "matte-black": { frame: "classic-spindle-matte-black-frame.webp", dressed: "classic-spindle-matte-black-dressed.webp" },
    white: { frame: "classic-spindle-white-frame.webp", dressed: "classic-spindle-white-dressed.webp" },
    "graphite-grey": { frame: "classic-spindle-graphite-grey-frame.webp", dressed: "classic-spindle-graphite-grey-dressed.webp" },
    "antique-bronze": { frame: "classic-spindle-antique-bronze-frame.webp", dressed: "classic-spindle-antique-bronze-dressed.webp" },
    "deep-navy": { frame: "classic-spindle-deep-navy-frame.webp", dressed: "classic-spindle-deep-navy-dressed.webp" },
  },
  "square-grid": {
    "matte-black": { frame: "square-grid-matte-black-frame.webp", dressed: "square-grid-matte-black-dressed.webp" },
    white: { frame: "square-grid-white-frame.webp", dressed: "square-grid-white-dressed.webp" },
    "graphite-grey": { frame: "square-grid-graphite-grey-frame.webp", dressed: "square-grid-graphite-grey-dressed.webp" },
    "antique-bronze": { frame: "square-grid-antique-bronze-frame.webp", dressed: "square-grid-antique-bronze-dressed.webp" },
    "deep-navy": { frame: "square-grid-deep-navy-frame.webp", dressed: "square-grid-deep-navy-dressed.webp" },
  },
  "arched-rail": {
    "matte-black": { frame: "arched-rail-matte-black-frame.webp", dressed: "arched-rail-matte-black-dressed.webp" },
    white: { frame: "arched-rail-white-frame.webp", dressed: "arched-rail-white-dressed.webp" },
    "graphite-grey": { frame: "arched-rail-graphite-grey-frame.webp", dressed: "arched-rail-graphite-grey-dressed.webp" },
    "antique-bronze": { frame: "arched-rail-antique-bronze-frame.webp", dressed: "arched-rail-antique-bronze-dressed.webp" },
    "deep-navy": { frame: "arched-rail-deep-navy-frame.webp", dressed: "arched-rail-deep-navy-dressed.webp" },
  },
};

export const getCatalogVariantImage = (design: BedDesignId, finish: FinishId, state: BedImageState) => {
  if (design === "double-lowline") {
    return `/assets/bed-catalog-variants/double-lowline-${finish}-${state}.png`;
  }
  return `/assets/bed-catalog-variants/${bedCatalogVariants[design][finish][state]}`;
};
