import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/cart-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeFinds | Metallic beds for homes and businesses",
  description:
    "Explore sample HomeFinds metallic bed styles and use the bed configurator. Product and commercial details are awaiting confirmation.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
