"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { categories } from "@/lib/sample-data";
import { useCart } from "@/components/cart-provider";

export function SiteHeader({ categories: categoryItems = categories }: { categories?: typeof categories }) {
  const [open, setOpen] = useState(false);
  const { count, openCart } = useCart();
  const shopHref = categoryItems.find((category) => category.href && category.href !== "#shop")?.href ?? "/#shop";
  return (
    <header className="site-header">
      <button
        className="header-icon menu-trigger"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <Link className="wordmark" href="/" aria-label="Mighty\u2019s Home Finds home">
        <Image
          src="/assets/brand/mightys-home-finds-logo.png"
          alt="Mighty\u2019s Home Finds - Home & Living Essentials"
          width={460}
          height={135}
          priority
          className="brand-logo"
        />
      </Link>
      <nav className={`header-links ${open ? "open" : ""}`}>
        <Link
          href={shopHref}
          onClick={() => setOpen(false)}
        >
          Shop Beds
        </Link>
        <Link
          href={shopHref}
          onClick={() => setOpen(false)}
        >
          Build Your Bed
        </Link>
        <Link href="/#business" onClick={() => setOpen(false)}>
          For Business
        </Link>
        <div className="menu-category-links" aria-label="Browse bed types">
          {categoryItems.map((category) => (
            <Link
              key={category.slug}
              href={category.href}
              onClick={() => setOpen(false)}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </nav>
      <div className="header-tools">
        <button className="header-icon" aria-label="Search sample beds">
          <Search />
        </button>
        <button
          type="button"
          onClick={openCart}
          className="header-icon cart-icon"
          aria-label={`Open shopping bag${count ? `, ${count} items` : ""}`}
        >
          <ShoppingCart />
          {count > 0 && <span>{count > 99 ? "99+" : count}</span>}
        </button>
      </div>
    </header>
  );
}


