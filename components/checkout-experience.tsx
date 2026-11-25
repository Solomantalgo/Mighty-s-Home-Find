"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { useCart, type CartItem } from "@/components/cart-provider";
import {
  bedMeasurements,
  formatUGX,
  bedMeasurementPrice,
  products,
} from "@/lib/sample-data";
import { getCatalogVariantImage } from "@/lib/bed-color-variants";
import type { FinishId } from "@/lib/bed-color-variants";

type OrderState = { reference: string; paymentId: string; payerPhone: string };

export function CheckoutExperience({
  initialItem,
  sharedSizes = bedMeasurements,
  receivingNumber,
  supportContact,
  ussdCode,
}: {
  initialItem: CartItem | null;
  sharedSizes?: readonly { id: string; label: string; price: number }[];
  receivingNumber: string;
  supportContact: string;
  ussdCode: string;
}) {
  const cart = useCart();
  const sourceItems = !cart.ready ? [] : cart.items.length > 0 ? cart.items : initialItem ? [initialItem] : [];
  const checkoutItems = sourceItems.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    const finish = product?.finishes.find((entry) => entry.id === item.finishId) ?? (item.finishName ? { id: item.finishId, name: item.finishName, hex: "#555" } : undefined);
    const measurement = sharedSizes.find((entry) => entry.id === item.measurement) ?? (item.sizeLabel ? { id: item.measurement, label: item.sizeLabel, price: item.unitPrice ?? 0 } : undefined);
    const resolvedProduct = product ?? (item.productName && item.productSlug ? { id: item.productId, slug: item.productSlug, name: item.productName, shortName: item.productName, category: "", categorySlug: "", rating: "", reviews: 0, description: "", frame: item.frameImage ?? item.dressedImage ?? "", dressed: item.dressedImage ?? "", image: item.image ?? "", configuratorDesign: "", defaultImageSize: item.imageSizeId, previewSizes: [], colorName: item.finishName ?? "", finishes: finish ? [finish] : [], delivery: "", included: "", material: "", care: "", alt: item.alt ?? item.productName } : undefined);
    if (!resolvedProduct || !finish || !measurement) return [];
    const lineTotal = (measurement.price || item.unitPrice || bedMeasurementPrice(item.measurement)) * item.quantity;
    return [{ item, product: resolvedProduct, finish, measurement, lineTotal }];
  });
  const firstProduct = checkoutItems[0]?.product;
  const [copied, setCopied] = useState("");
  const [order, setOrder] = useState<OrderState | null>(null);
  const [paymentId, setPaymentId] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [formError, setFormError] = useState("");
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = subtotal;
  const hasReceiver = receivingNumber.length > 0;

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("Copy unavailable");
    }
  }

  function submitReference(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!paymentId.trim()) {
      setFormError("Enter the MoMo transaction/payment ID to continue.");
      return;
    }
    setOrder({
      reference: `HF-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      paymentId: paymentId.trim(),
      payerPhone: payerPhone.trim(),
    });
  }

  return (
    <>
      <SiteHeader />
      <main className="checkout-page">
        <div className="checkout-heading">
          <Link href={firstProduct ? `/products/${firstProduct.slug}` : "/"}>
            <ArrowLeft size={16} /> Back to beds
          </Link>
          <span>CHECKOUT &middot; SAMPLE ORDER</span>
          <h1>Complete your order</h1>
          <p>
            Review the total, pay directly to HomeFinds by MTN MoMo, then submit
            the transaction ID.
          </p>
        </div>
        {order ? (
          <section className="checkout-confirmation" role="status">
            <span className="confirmation-icon">
              <Check size={24} />
            </span>
            <p className="checkout-eyebrow">ORDER REFERENCE</p>
            <h2>{order.reference}</h2>
            <strong>
              Payment submitted &mdash; awaiting HomeFinds verification.
            </strong>
            <p>
              Your payment ID was entered in this browser prototype only. It has
              not been sent to HomeFinds, verified, or marked paid.
            </p>
            <div className="status-pills">
              <span>Payment: pending verification</span>
              <span>Fulfilment: awaiting payment</span>
            </div>
            {supportContact ? (
              <p>
                Need help? Contact HomeFinds at{" "}
                <a href={`tel:${supportContact}`}>{supportContact}</a>.
              </p>
            ) : (
              <p>Payment support contact needs to be configured.</p>
            )}
            <Link className="checkout-primary" href="/">
              Continue browsing
            </Link>
          </section>
        ) : !cart.ready ? (
          <section className="checkout-main-card checkout-empty-state" aria-busy="true">
            <h2>Loading your bag&hellip;</h2>
            <p>Your saved bed choices are being restored.</p>
          </section>
        ) : checkoutItems.length === 0 ? (
          <section className="checkout-main-card checkout-empty-state">
            <h2>Your bag is empty</h2>
            <p>Add a bed design before continuing to checkout.</p>
            <Link className="checkout-primary" href="/#shop">Browse bed designs</Link>
          </section>
        ) : (
          <div className="checkout-grid">
            <section className="checkout-main-card">
              <div className="checkout-section-title">
                <span>1</span>
                <div>
                  <h2>Review your order</h2>
                  <p>Illustrative product and delivery information</p>
                </div>
              </div>
              {checkoutItems.map(({ item, product, finish, measurement, lineTotal }) => (
                <div className="checkout-item" key={item.key}>
                  <div className="checkout-item-image">
                    <Image
                      src={item.dressedImage ?? getCatalogVariantImage(product.configuratorDesign, item.imageSizeId, finish.id as FinishId, "dressed")}
                      alt={`${product.shortName} bed in ${finish.name}`}
                      fill
                      sizes="100px"
                    />
                  </div>
                  <div className="checkout-item-info">
                    <b>{product.name}</b>
                    <small>{measurement.label} &middot; {finish.name} finish</small>
                    {!item.productName && <small>Image concept: {product.previewSizes.find((size) => size.id === item.imageSizeId)?.label}</small>}
                    <small>Quantity: {item.quantity}</small>
                  </div>
                  <strong>{formatUGX(lineTotal)}</strong>
                </div>
              ))}
              <div className="checkout-totals">
                <div>
                  <span>Items subtotal</span>
                  <b>{formatUGX(subtotal)}</b>
                </div>
                <div>
                  <span>Delivery estimate</span>
                  <b>2&ndash;4 days</b>
                </div>
                <div className="checkout-grand-total">
                  <span>Exact total due</span>
                  <strong>{formatUGX(total)}</strong>
                </div>
                {checkoutItems.some(({ item }) => !item.productName) && <small>Illustrative sample amount for this visual prototype.</small>}
              </div>
              <div className="checkout-section-title payment-title">
                <span>2</span>
                <div>
                  <h2>Pay with MTN MoMo</h2>
                  <p>Use your phone or another payer&rsquo;s phone</p>
                </div>
              </div>
              <div
                className={`receiver-card ${hasReceiver ? "" : "receiver-missing"}`}
              >
                <div>
                  <small>HOMEFINDS RECEIVING NUMBER</small>
                  <strong>
                    {hasReceiver
                      ? receivingNumber
                      : "Receiving number not configured"}
                  </strong>
                </div>
                <button
                  type="button"
                  disabled={!hasReceiver}
                  onClick={() => copy("number", receivingNumber)}
                >
                  <Copy size={15} />
                  {copied === "number" ? "Copied" : "Copy number"}
                </button>
                <p>
                  {hasReceiver
                    ? "Confirm this recipient name on your phone before sending."
                    : "A HomeFinds MoMo number must be configured before any real payment can be made."}
                </p>
              </div>
              <div className="ussd-card">
                <div>
                  <small>MTN MOMO USSD CODE</small>
                  <strong>{ussdCode}</strong>
                </div>
                <div className="ussd-actions">
                  <button type="button" onClick={() => copy("code", ussdCode)}>
                    <Copy size={15} />
                    {copied === "code" ? "Copied" : "Copy code"}
                  </button>
                  <a href={`tel:${encodeURIComponent(ussdCode)}`}>
                    <Phone size={15} />
                    Open phone dialer
                  </a>
                </div>
              </div>
              <ol className="payment-steps">
                <li>
                  <span>1</span>
                  <p>
                    Dial <b>{ussdCode}</b> on your MTN phone.
                  </p>
                </li>
                <li>
                  <span>2</span>
                  <p>Follow the prompts to send Mobile Money.</p>
                </li>
                <li>
                  <span>3</span>
                  <p>
                    Send the exact amount <b>{formatUGX(total)}</b> to the
                    HomeFinds receiving number above.
                  </p>
                </li>
                <li>
                  <span>4</span>
                  <p>
                    Keep the MoMo transaction/payment ID, then return here and
                    enter it below.
                  </p>
                </li>
              </ol>
              <form
                className="payment-reference-form"
                onSubmit={submitReference}
              >
                <label>
                  MoMo transaction / payment ID
                  <input
                    value={paymentId}
                    onChange={(event) => setPaymentId(event.target.value)}
                    placeholder="Enter the ID from your MoMo message"
                    required
                    autoComplete="off"
                  />
                </label>
                <label>
                  Payer phone number{" "}
                  <span>(optional if different from your contact)</span>
                  <input
                    value={payerPhone}
                    onChange={(event) => setPayerPhone(event.target.value)}
                    placeholder="e.g. 0770 000 000"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
                {formError && (
                  <p className="checkout-form-error" role="alert">
                    {formError}
                  </p>
                )}
                <button className="checkout-primary" type="submit">
                  Submit payment reference
                </button>
                <p className="prototype-transmission-note">
                  <ShieldCheck size={15} /> Prototype only: this form creates a
                  local confirmation in this browser. No payment reference is
                  sent to HomeFinds, and a submitted ID is not payment
                  verification.
                </p>
              </form>
            </section>
            <aside className="checkout-aside">
              <div className="checkout-aside-icon">
                <PackageCheck size={22} />
              </div>
              <h2>After you submit</h2>
              <p>
                HomeFinds must verify the transaction ID, amount, recipient, and
                order before payment can be marked verified.
              </p>
              <div className="separate-status">
                <span>
                  <b>Payment status</b>
                  <small>Awaiting HomeFinds verification</small>
                </span>
                <span>
                  <b>Fulfilment status</b>
                  <small>Awaiting payment verification</small>
                </span>
              </div>
              {supportContact ? (
                <a href={`tel:${supportContact}`} className="support-action">
                  <MessageCircle size={16} />
                  Payment support: {supportContact}
                </a>
              ) : (
                <div className="config-needed">
                  <b>Payment support contact needed</b>
                  <small>
                    Configure a HomeFinds contact for payment questions.
                  </small>
                </div>
              )}
              <div className="aside-delivery">
                <Truck size={16} /> Sample estimate: 2&ndash;4 days
              </div>
            </aside>
          </div>
        )}
        <div className="checkout-footnote">
          Illustrative sample checkout &middot; No payment gateway or automatic payment
          verification is connected.
        </div>
      </main>
      <footer className="site-footer">
        <Link href="/">Home Finds</Link>
        <span>Manual MTN MoMo &middot; Prototype</span>
        <span>Payment status separate from fulfilment</span>
      </footer>
      <MobileNav />
    </>
  );
}


