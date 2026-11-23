/** Merchant contact values stay centralized. Supply these through the deployment environment. */
export const checkoutConfig = {
  momoReceivingNumber: process.env.NEXT_PUBLIC_HOMEFINDS_MOMO_RECEIVING_NUMBER?.trim() || "",
  paymentSupportContact: process.env.NEXT_PUBLIC_HOMEFINDS_PAYMENT_SUPPORT_CONTACT?.trim() || "",
  ussdCode: "*185*1*1#",
};

