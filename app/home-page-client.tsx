"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Headset,
  ShieldCheck,
  Tag,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import {
  benefits,
  categories,
  formatUGX,
  products,
  bedMeasurements,
} from "@/lib/sample-data";

const icons = [Truck, ShieldCheck, Tag, Headset];

export default function HomePage() {
  const [wishlisted, setWishlisted] = useState<string[]>([]);
  function toggleWish(id: string) {
    setWishlisted((old) =>
      old.includes(id) ? old.filter((item) => item !== id) : [...old, id],
    );
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="home-hero">
          <Image
            src="/assets/homefinds-bedroom-hero.png"
            alt="Warm bedroom with a dark metallic bed"
            fill
            priority
            loading="eager"
            sizes="100vw"
            className="hero-background"
          />
          <div className="hero-shade" />
          <div className="home-hero-copy">
            <span className="hero-eyebrow">
              METALLIC BEDS FOR HOMES &amp; BUSINESSES
            </span>
            <h1>
              Sleep better.
              <br />
              Live beautifully.
            </h1>
            <p>
              Durable, stylish metallic beds for homes, hostels, hotels and
              institutions.
            </p>
            <div className="hero-buttons">
              <Link
                className="button gold-button"
                href="/products/classic-spindle?category=king-beds"
              >
                Shop Beds <ArrowRight size={17} />
              </Link>
              <Link className="button ghost-button" href="#shop">
                Explore Collections
              </Link>
            </div>
          </div>
          <div className="hero-dots" aria-hidden="true">
            <i className="active" />
            <i />
            <i />
          </div>
        </section>
        <section className="benefits-strip" aria-label="HomeFinds benefits">
          {benefits.map((item, i) => {
            const Icon = icons[i];
            return (
              <div className="benefit" key={item.title}>
                <Icon size={24} strokeWidth={1.7} />
                <span>
                  <b>{item.title}</b>
                  <small>{item.detail}</small>
                </span>
              </div>
            );
          })}
        </section>
        <section className="content-section category-section" id="shop">
          <div className="section-title">
            <h2>Shop by Category</h2>
            <Link href="#shop">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="category-list">
            {categories.map((category) => (
              <Link
                className="category-tile"
                key={category.name}
                href={category.href}
              >
                <div className="category-photo">
                  <Image
                    src={category.image}
                    alt={category.alt}
                    className="category-main-image"
                    fill
                    sizes="(max-width: 650px) 48vw, 25vw"
                  />
                  <Image
                    src={category.alternateImage}
                    alt=""
                    aria-hidden="true"
                    className="category-alternate-image"
                    fill
                    sizes="(max-width: 650px) 48vw, 25vw"
                  />
                  {category.slug === "triple-beds" && (
                    <span className="category-concept-badge">Concept imagery</span>
                  )}
                </div>
                <span>
                  {category.name}
                  <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="content-section featured-section" id="products">
          <div className="section-title">
            <h2>Featured Beds</h2>
            <Link href="/products/classic-spindle?category=king-beds">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="featured-row">
            {products.map((product) => {
              const category = categories.find(
                (item) => item.name === product.category,
              );
              const href = `/products/${product.slug}?category=${category?.slug ?? "king-beds"}`;
              return (
                <article className="featured-card" key={product.id}>
                  <Link className="featured-photo" href={href}>
                    <Image
                      src={product.image}
                      alt={product.alt}
                      fill
                      sizes="(max-width: 650px) 44vw, 240px"
                    />
                    <span className="sample-pill">Sample</span>
                  </Link>
                  <button
                    className={`wishlist-button ${wishlisted.includes(product.id) ? "liked" : ""}`}
                    onClick={() => toggleWish(product.id)}
                    aria-label={
                      wishlisted.includes(product.id)
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                  >
                    <Heart
                      size={19}
                      fill={
                        wishlisted.includes(product.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                  <div className="featured-info">
                    <Link href={href}>
                      <h3>{product.name}</h3>
                    </Link>
                    <strong>From {formatUGX(bedMeasurements[0].price)}</strong>
                    <span className="rating">
                      <b>&#9733;</b> {product.rating}{" "}
                      <small>({product.reviews})</small>
                    </span>
                    <Link className="add-button" href={href}>
                      Choose options <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="business-feature" id="business">
          <Image
            src="/assets/homefinds-bedroom-hero.png"
            alt="Bedroom ready to furnish"
            fill
            sizes="100vw"
          />
          <div className="business-shade" />
          <div className="business-copy">
            <span>FOR BUSINESS BUYERS</span>
            <h2>
              Furnish Hostels,
              <br />
              Hotels &amp; Institutions
            </h2>
            <p>Bulk orders and planning for business buyers.</p>
            <Link
              className="button gold-button"
              href="https://wa.me/?text=Hello%20HomeFinds%2C%20I%27d%20like%20to%20ask%20about%20a%20business%20bed%20order."
              target="_blank"
              rel="noreferrer"
            >
              Get a Business Quote <ArrowRight size={15} />
            </Link>
          </div>
        </section>
        <div className="prototype-note">
          Visual prototype &middot; Sample prices, ratings and delivery details are
          illustrative.
        </div>
      </main>
      <footer className="site-footer">
        <Link href="/">Home Finds</Link>
        <span>Metallic beds &middot; Kampala</span>
        <span>Metallic bed designs and sizes</span>
      </footer>
      <MobileNav />
    </>
  );
}


