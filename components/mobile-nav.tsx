"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, UserRound } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const onShop = pathname.startsWith("/products/") || pathname.startsWith("/checkout");
  return <nav className="mobile-nav" aria-label="Mobile navigation">
    <Link href="/" className={pathname === "/" ? "current" : ""}><Home size={19} fill={pathname === "/" ? "currentColor" : "none"}/><span>Home</span></Link>
    <Link href="/products/classic-spindle?category=king-beds" className={onShop ? "current" : ""}><LayoutGrid size={19}/><span>Shop</span></Link>
    <Link href="/#products"><Heart size={20}/><span>Wishlist</span></Link>
    <Link href="/#account"><UserRound size={19}/><span>Account</span></Link>
  </nav>;
}

