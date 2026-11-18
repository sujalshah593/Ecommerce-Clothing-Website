import crypto from "crypto";

const normalizeText = (value) => String(value ?? "").trim().replace(/\s+/g, " ");

export const normalizeCheckoutPayload = ({ orderItems, shippingAddress, paymentMethod, totalPrice }) => ({
  items: Array.from([...orderItems]
    .reduce((quantities, item) => {
      const productId = String(item.product);
      quantities.set(productId, (quantities.get(productId) || 0) + item.qty);
      return quantities;
    }, new Map())
    .entries())
    .map(([product, qty]) => ({ product, qty }))
    .sort((left, right) => left.product.localeCompare(right.product)),
  shippingAddress: {
    address: normalizeText(shippingAddress?.address),
    city: normalizeText(shippingAddress?.city),
    postalCode: normalizeText(shippingAddress?.postalCode).toUpperCase(),
    country: normalizeText(shippingAddress?.country).toUpperCase(),
  },
  paymentMethod: normalizeText(paymentMethod).toUpperCase(),
  totalPrice: Number(totalPrice),
  currency: "INR",
});

export const checkoutFingerprint = (payload) => crypto
  .createHash("sha256")
  .update(JSON.stringify(normalizeCheckoutPayload(payload)))
  .digest("hex");

export const razorpayReceiptForOrder = (orderId) => `shreeji_${String(orderId)}`;
export const razorpayReceiptsForOrder = (orderId) => [razorpayReceiptForOrder(orderId), String(orderId)];

export const reconcileRazorpayOrder = async ({ razorpay, order }) => {
  const receipts = razorpayReceiptsForOrder(order._id);
  const matches = [];
  for (const receipt of receipts) {
    const response = await razorpay.orders.all({ receipt, count: 10 });
    matches.push(...(response?.items || []).filter((candidate) =>
      candidate.receipt === receipt &&
      Number(candidate.amount) === Math.round(order.totalPrice * 100) &&
      candidate.currency === "INR",
    ));
    if (matches.length > 0) break;
  }
  if (matches.length > 1) {
    const error = new Error("Multiple Razorpay orders matched one checkout receipt");
    error.code = "AMBIGUOUS_PROVIDER_ORDER";
    error.status = 409;
    throw error;
  }
  return matches[0] || null;
};
