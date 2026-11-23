import type { Metadata } from "next";
import { CheckoutExperience } from "@/components/checkout-experience";
import { checkoutConfig } from "@/lib/checkout-config";
import { bedMeasurements, products, type BedMeasurementId } from "@/lib/sample-data";
import type { CartItem } from "@/components/cart-provider";

export const metadata: Metadata = {
  title: "Checkout | HomeFinds",
  description:
    "Review your illustrative HomeFinds order and follow manual MTN MoMo payment steps.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string;
    measurement?: string;
    finish?: string;
    quantity?: string;
  }>;
}) {
  const params = await searchParams;
  const product = products.find((item) => item.slug === params.product);
  const measurement = bedMeasurements.some(
    (item) => item.id === params.measurement,
  )
    ? (params.measurement as BedMeasurementId)
    : "5x6";
  const finishId = product?.finishes.find((finish) => finish.id === params.finish)?.id ?? product?.finishes[0].id;
  const quantity = Math.min(20, Math.max(1, Number.parseInt(params.quantity ?? "1", 10) || 1));
  const initialItem: CartItem | null = product && finishId ? {
    key: `${product.id}:${measurement}:${finishId}`,
    productId: product.id,
    measurement,
    finishId,
    quantity,
  } : null;
  return (
    <CheckoutExperience
      initialItem={initialItem}
      receivingNumber={checkoutConfig.momoReceivingNumber}
      supportContact={checkoutConfig.paymentSupportContact}
      ussdCode={checkoutConfig.ussdCode}
    />
  );
}
