"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Layers3,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { useCart } from "@/components/cart-provider";
import {
  bedMeasurements,
  DEFAULT_BED_MEASUREMENT,
  bedMeasurementPrice,
  formatUGX,
  categories,
  products,
  sampleReview,
  type BedMeasurementId,
  type BedProduct,
  type Finish,
} from "@/lib/sample-data";
import { getCatalogVariantImage, type FinishId } from "@/lib/bed-color-variants";

type ViewMode = "compare" | "frame" | "dressed";

export function ProductExperience({
  product: initialProduct,
  backHref,
  categorySlug,
}: {
  product: BedProduct;
  backHref: string;
  categorySlug: string;
}) {
  const { addItem } = useCart();
  const [productId, setProductId] = useState(initialProduct.id);
  const [activeCategorySlug, setActiveCategorySlug] = useState(categorySlug);
  const product =
    products.find((item) => item.id === productId) ?? initialProduct;
  const activeCategory =
    categories.find((item) => item.slug === activeCategorySlug) ??
    categories.find((item) => item.name === product.category) ??
    categories[1];
  const initialFinishId =
    initialProduct.finishes.find(
      (item) => item.name === initialProduct.colorName,
    )?.id ?? initialProduct.finishes[0].id;
  const [finishId, setFinishId] = useState<FinishId>(initialFinishId);
  const [selectedMeasurement, setSelectedMeasurement] =
    useState<BedMeasurementId>(DEFAULT_BED_MEASUREMENT);
  const [mode, setMode] = useState<ViewMode>("compare");
  const [split, setSplit] = useState(49);
  const [wishlisted, setWishlisted] = useState(false);
  const [designPickerOpen, setDesignPickerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const finish: Finish =
    product.finishes.find((item) => item.id === finishId) ??
    product.finishes[0];
  const frameImage = getCatalogVariantImage(
    product.configuratorDesign,
    finish.id,
    "frame",
  );
  const dressedImage = getCatalogVariantImage(
    product.configuratorDesign,
    finish.id,
    "dressed",
  );
  const modelChoices = activeCategory.modelIds
    .map((id) => products.find((item) => item.id === id))
    .filter((item): item is BedProduct => Boolean(item));
  const unitPrice = bedMeasurementPrice(selectedMeasurement);
  const total = unitPrice * quantity;
  function selectModel(
    nextProduct: BedProduct,
    nextCategorySlug = activeCategorySlug,
  ) {
    const nextFinish =
      nextProduct.finishes.find(
        (item) => item.name === nextProduct.colorName,
      ) ?? nextProduct.finishes[0];
    setActiveCategorySlug(nextCategorySlug);
    setProductId(nextProduct.id);
    setFinishId(nextFinish.id);
    setQuantity(1);
    setDesignPickerOpen(false);
    setMode("compare");
    setSplit(49);
  }
  function selectCategory(slug: string) {
    const category = categories.find((item) => item.slug === slug);
    if (!category) return;
    const next = products.find((item) => item.id === category.defaultProductId);
    if (next) selectModel(next, category.slug);
  }
  function addToCart() {
    addItem({
      productId: product.id,
      measurement: selectedMeasurement,
      finishId: finish.id,
      quantity,
    });
  }
  return (
    <>
      <SiteHeader />
      <main className="product-page">
        <div className="product-crumb">
          <Link href={backHref}>
            <ArrowLeft size={15} /> Back to beds
          </Link>
          <nav aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/products/classic-spindle?category=king-beds">
              Shop Beds
            </Link>
            <span>/</span>
            <Link href={activeCategory.href}>{activeCategory.name}</Link>
            <span>/</span>
            <span aria-current="page">{product.shortName}</span>
          </nav>
        </div>
        <section
          className={`bed-type-explorer ${designPickerOpen ? "picker-open" : ""}`}
          aria-label="Browse bed types and models"
        >
          <div className="selector-intro">
            <span>FIND YOUR FIT</span>
            <strong>Browse bed types</strong>
            <small>Choose a category, then explore its frames.</small>
          </div>
          <div className="bed-selector-group">
            <strong>Bed category</strong>
            <div
              className="category-chip-rail"
              role="group"
              aria-label="Bed category"
            >
              {categories.map((category) => (
                <button
                  type="button"
                  className={
                    category.slug === activeCategorySlug ? "active" : ""
                  }
                  key={category.slug}
                  onClick={() => selectCategory(category.slug)}
                  aria-pressed={category.slug === activeCategorySlug}
                >
                  {category.chipLabel}
                </button>
              ))}
            </div>
          </div>
          <div className="bed-selector-group model-selector">
            <strong>{activeCategory.modelHeading}</strong>
            <div className="design-picker">
              <button
                type="button"
                className="design-picker-trigger"
                aria-expanded={designPickerOpen}
                aria-controls="bed-design-options"
                onClick={() => setDesignPickerOpen((open) => !open)}
              >
                <span className="model-thumb selected-design-thumb">
                  <Image src={product.image} alt="" fill sizes="72px" />
                </span>
                <span className="design-picker-trigger-copy">
                  <small>Choose your design</small>
                  <b>{product.shortName}</b>
                </span>
                <ChevronDown size={17} className={designPickerOpen ? "picker-chevron open" : "picker-chevron"} />
              </button>
              {designPickerOpen && (
                <div
                  className="design-picker-panel"
                  id="bed-design-options"
                  role="group"
                  aria-label={`${activeCategory.chipLabel} bed designs`}
                >
                  {modelChoices.map((item) => (
                    <button
                      type="button"
                      className={`design-option ${product.id === item.id ? "active" : ""}`}
                      onClick={() => selectModel(item)}
                      key={item.id}
                      aria-pressed={product.id === item.id}
                    >
                      <span className="design-option-image">
                        <Image src={item.image} alt="" fill sizes="(max-width: 650px) 44vw, 220px" />
                      </span>
                      <span className="design-option-name">{item.shortName}</span>
                      {product.id === item.id && <Check size={15} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="product-layout">
          <div className="product-visual-column">
            <div
              className={`comparison-stage mode-${mode}`}
              onClick={(event) => {
                if (
                  mode === "compare" &&
                  (event.target as HTMLElement).closest(".comparison-stage")
                ) {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setSplit(
                    Math.max(
                      12,
                      Math.min(
                        88,
                        ((event.clientX - rect.left) / rect.width) * 100,
                      ),
                    ),
                  );
                }
              }}
            >
              <Image
                className="comparison-image frame-image"
                src={frameImage}
                alt={`${product.name} ${finish.name} bare metal frame without mattress or bedding`}
                fill
                unoptimized
                priority
                sizes="(max-width: 760px) 100vw, 58vw"
              />
              {mode !== "frame" && (
                <div
                  className={`dressed-reveal ${mode === "dressed" ? "dressed-full" : ""}`}
                  style={
                    mode === "compare"
                      ? { clipPath: `inset(0 0 0 ${split}%)` }
                      : undefined
                  }
                >
                  <Image
                    className="comparison-image dressed-image"
                    src={dressedImage}
                    alt={`${product.name} ${finish.name} with sample mattress and bedding`}
                    fill
                    unoptimized
                    sizes="(max-width: 760px) 100vw, 58vw"
                  />
                </div>
              )}
              <div className="image-top-controls">
                <Link
                  href="/"
                  className="round-back"
                  aria-label="Back to homepage"
                >
                  <ArrowLeft size={18} />
                </Link>
                <div
                  className="image-view-tabs"
                  role="group"
                  aria-label="Preview mode"
                >
                  <button
                    onClick={() => setMode("frame")}
                    className={mode === "frame" ? "selected" : ""}
                  >
                    Frame Only
                  </button>
                  <button
                    onClick={() => setMode("dressed")}
                    className={
                      mode === "dressed" || mode === "compare" ? "selected" : ""
                    }
                  >
                    Fully Dressed
                  </button>
                </div>
                <span className="finish-badge">{finish.name}</span>
              </div>
              {mode === "compare" && (
                <>
                  <span className="image-label-frame">FRAME ONLY</span>
                  <span className="image-label-dressed">FULLY DRESSED</span>
                  <div
                    className="compare-divider"
                    style={{ left: `${split}%` }}
                  >
                    <span className="divider-handle">
                      <ArrowLeft size={14} />
                      <ArrowRight size={14} />
                    </span>
                  </div>
                  <input
                    className="compare-range"
                    aria-label="Drag to compare frame-only and dressed views"
                    type="range"
                    min={12}
                    max={88}
                    value={split}
                    onChange={(event) => setSplit(Number(event.target.value))}
                  />
                </>
              )}
              <div className="image-bottom-note">
                {mode === "frame"
                  ? "No mattress or bedding"
                  : mode === "dressed"
                    ? "Sample bedding style"
                    : "Drag to compare the frame and styled view"}
              </div>
            </div>
            <div className="preview-explainer">
              <span className="sparkle">✧</span>
              <div>
                <b>Interactive Bed Preview</b>
                <p>
                  Choose a frame colour to update both views. Bedding remains
                  styled as shown.
                </p>
              </div>
            </div>
          </div>
          <aside className="purchase-panel">
            <div className="finish-section">
              <div className="finish-title">
                <h2>Choose Frame Colour</h2>
                <small>{finish.name}</small>
              </div>
              <div className="finish-swatches">
                {product.finishes.map((option) => (
                  <button
                    className={`finish-swatch ${finish.id === option.id ? "active" : ""}`}
                    key={option.name}
                    style={{ "--swatch": option.hex } as React.CSSProperties}
                    onClick={() => setFinishId(option.id)}
                    aria-label={option.name}
                    aria-pressed={finish.id === option.id}
                    title={option.name}
                  >
                    <span />
                    {finish.id === option.id && <Check size={13} />}
                    <small>{option.name}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="details-divider" />
            <div className="detail-title-row">
              <div>
                <h2>{product.name}</h2>
                <div className="sample-price">
                  {formatUGX(unitPrice)} <span>sample price</span>
                </div>
              </div>
              <button
                className={`wishlist-large ${wishlisted ? "liked" : ""}`}
                aria-label={
                  wishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                onClick={() => setWishlisted(!wishlisted)}
              >
                <Heart fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="detail-rating">
              <span>★</span>
              <b>{product.rating}</b>
              <small>({product.reviews} sample reviews)</small>
            </div>
            <div className="size-choice">
              <span>Choose measurement</span>
              <div>
                {bedMeasurements.map((measurement) => (
                  <button
                    key={measurement.id}
                    onClick={() => setSelectedMeasurement(measurement.id)}
                    className={
                      measurement.id === selectedMeasurement ? "active" : ""
                    }
                    aria-pressed={measurement.id === selectedMeasurement}
                  >
                    {measurement.label}
                    <small>{formatUGX(measurement.price)}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="delivery-chip">
              <Truck size={18} />
              <span>
                <b>{product.delivery}</b>
                <small>Sample delivery estimate</small>
              </span>
            </div>
            <div className="order-row">
              <div className="quantity-picker">
                <button
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                    onClick={() => setQuantity((value) => Math.min(20, value + 1))}
                  aria-label="Increase quantity"
                >
                  ＋
                </button>
              </div>
              <button type="button" className="primary-order" onClick={addToCart}>
                <ShoppingCart size={17} /> Add to Bag <span>·</span>{" "}
                {formatUGX(total)}
              </button>
            </div>
            <a
              className="whatsapp-order"
              href={`https://wa.me/?text=${encodeURIComponent(`Hello HomeFinds, I'd like to ask about the ${product.name}, ${bedMeasurements.find((item) => item.id === selectedMeasurement)?.label}, in ${finish.name}.`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
            <div className="included-note">
              <PackageCheck size={17} />
              <p>{product.included}</p>
            </div>
            <div className="sample-detail-foot">
              <span>Illustrative sample information</span>
              <span>{product.material}</span>
            </div>
          </aside>
        </section>
        <section className="detail-benefits">
          <div>
            <span>
              <Truck size={21} />
            </span>
            <p>
              <b>Delivery estimate</b>
              <small>2–4 days</small>
            </p>
          </div>
          <div>
            <span>
              <ShieldCheck size={21} />
            </span>
            <p>
              <b>Metal frame</b>
              <small>Sample details</small>
            </p>
          </div>
          <div>
            <span>
              <Layers3 size={21} />
            </span>
            <p>
              <b>Three measurements</b>
              <small>Choose your fit</small>
            </p>
          </div>
        </section>
        <section className="related-section">
          <div className="section-title">
            <h2>More Metallic Beds</h2>
            <Link href="/products/classic-spindle?category=king-beds">
              Explore beds <ArrowRight size={14} />
            </Link>
          </div>
          <div className="related-row">
            {products
              .filter((item) => item.id !== product.id)
              .map((item) => (
                <button
                  type="button"
                  onClick={() =>
                    selectModel(
                      item,
                      categories.find(
                        (category) =>
                          category.name === item.category,
                      )?.slug,
                    )
                  }
                  key={item.id}
                  className="related-card"
                >
                  <div className="related-photo">
                    <Image src={item.image} alt={item.alt} fill sizes="170px" />
                    <span>
                      <Heart size={13} />
                    </span>
                  </div>
                  <b>{item.shortName}</b>
                  <small>{formatUGX(unitPrice)}</small>
                </button>
              ))}
          </div>
        </section>
        <section className="review-card">
          <div className="review-quote-mark">“</div>
          <div className="review-copy">
            <p>“{sampleReview.quote}”</p>
            <div className="review-meta">
              <span>{"★".repeat(sampleReview.stars)}</span>
              <small>— {sampleReview.author} · sample review</small>
            </div>
          </div>
          <div className="review-avatar">
            <span>H</span>
            <small>HomeFinds</small>
          </div>
        </section>
        <div className="product-disclosure">
          Sample prices, ratings, finish previews and delivery information are
          illustrative.
        </div>
      </main>
      <footer className="site-footer">
        <Link href="/">Home Finds</Link>
        <span>{product.care}</span>
        <span>Sample product information</span>
      </footer>
      <MobileNav />
    </>
  );
}
