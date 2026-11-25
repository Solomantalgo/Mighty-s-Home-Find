"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function PendingMark() {
  const { pending } = useLinkStatus();
  return <span className={`admin-nav-progress${pending ? " is-pending" : ""}`} aria-hidden="true"/>;
}

export function AdminNavLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
  return <Link href={href} prefetch className={active ? "active" : ""} aria-current={active ? "page" : undefined}>{icon}<span>{label}</span><PendingMark/></Link>;
}
