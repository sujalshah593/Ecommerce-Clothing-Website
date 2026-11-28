import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../Redux/Slices/cartSlice.js";
import api from "../api/axios.js";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection.jsx";
import { useNavigate, Link } from "react-router-dom";
import { createElement, useCallback, useEffect, useState } from "react";
import { toastSuccess } from "../utils/toast.js";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CreditCard,
  LockKeyhole,
  ShoppingBag,
  Smartphone,
  Tag,
  Truck,
} from "lucide-react";

const CHECKOUT_KEY_STORAGE = "shreeji:checkout:idempotency-key";
const RAZORPAY_ATTEMPT_STORAGE = "shreeji:checkout:razorpay-attempt";

const createCheckoutFingerprint = ({ orderItems, shippingAddress }) => JSON.stringify({
  items: [...orderItems]
    .map(({ product, qty }) => ({ product: String(product), qty: Number(qty) }))
    .sort((left, right) => left.product.localeCompare(right.product)),
  shippingAddress: {
    address: String(shippingAddress.address || "").trim(),
    city: String(shippingAddress.city || "").trim(),
    postalCode: String(shippingAddress.postalCode || "").trim(),
    country: String(shippingAddress.country || "").trim(),
  },
});

const createCartFingerprint = (items) => JSON.stringify(
  items
    .map((item) => ({ product: String(item._id), qty: Number(item.qty) }))
    .sort((left, right) => left.product.localeCompare(right.product)),
);

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const { cartItems } = useSelector((state) => state.cart);

  const [orderStep, setOrderStep] = useState("shipping");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const createIdempotencyKey = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const saveRazorpayAttempt = (attempt) => {
    sessionStorage.setItem(RAZORPAY_ATTEMPT_STORAGE, JSON.stringify(attempt));
  };

  const clearRazorpayAttempt = () => {
    sessionStorage.removeItem(RAZORPAY_ATTEMPT_STORAGE);
    sessionStorage.removeItem(CHECKOUT_KEY_STORAGE);
  };

  const getStoredRazorpayAttempt = () => {
    try {
      const attempt = JSON.parse(sessionStorage.getItem(RAZORPAY_ATTEMPT_STORAGE));
      return attempt?.idempotencyKey && attempt?.payload ? attempt : null;
    } catch {
      return null;
    }
  };

  const getOrCreateRazorpayAttempt = (payload) => {
    const fingerprint = createCheckoutFingerprint(payload);
    const savedAttempt = getStoredRazorpayAttempt();
    if (savedAttempt?.fingerprint === fingerprint) {
      sessionStorage.setItem(CHECKOUT_KEY_STORAGE, savedAttempt.idempotencyKey);
      return savedAttempt;
    }

    const nextAttempt = {
      idempotencyKey: createIdempotencyKey(),
      fingerprint,
      cartFingerprint: createCartFingerprint(cartItems),
      payload,
      formData,
    };
    saveRazorpayAttempt(nextAttempt);
    sessionStorage.setItem(CHECKOUT_KEY_STORAGE, nextAttempt.idempotencyKey);
    return nextAttempt;
  };

  const recoverReservation = useCallback(async () => {
    let savedAttempt;
    try {
      savedAttempt = JSON.parse(sessionStorage.getItem(RAZORPAY_ATTEMPT_STORAGE));
    } catch {
      clearRazorpayAttempt();
      return null;
    }
    if (!savedAttempt?.idempotencyKey || !savedAttempt?.payload) return null;
    if (createCartFingerprint(cartItems) !== createCartFingerprint(savedAttempt.payload.orderItems.map((item) => ({ _id: item.product, qty: item.qty })))) {
      clearRazorpayAttempt();
      return null;
    }

    const { data } = await api.post("/orders/payment-order", savedAttempt.payload, {
      headers: { "Idempotency-Key": savedAttempt.idempotencyKey },
    });
    sessionStorage.setItem(CHECKOUT_KEY_STORAGE, savedAttempt.idempotencyKey);
    if (savedAttempt.formData) setFormData((current) => ({ ...current, ...savedAttempt.formData }));
    setOrderStep("payment");
    return data;
  }, [cartItems]);

  useEffect(() => {
    const savedAttempt = sessionStorage.getItem(RAZORPAY_ATTEMPT_STORAGE);
    if (!savedAttempt) return;
    recoverReservation().catch((error) => {
      if (error.response?.status === 409) {
        clearRazorpayAttempt();
        setFormError("Your online payment attempt is no longer active. Your cart is still saved.");
      }
    });
  }, [recoverReservation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateShipping = () => {
    const { firstName, email, phone, address, city, zipCode } = formData;

    if (!firstName || !email || !phone || !address || !city || !zipCode) {
      setFormError("Please fill all required shipping details.");
      return false;
    }
    setFormError("");
    return true;
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0,
  );
  const tax = Math.round(subtotal * 0.1);
  const shipping = 0;
  const total = subtotal + tax + shipping;

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout"));
    document.body.appendChild(script);
  });

  const showCheckoutError = (message) => {
    toast.error(message, { position: "top-right", autoClose: 2500 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // STEP 1 — shipping
    if (orderStep === "shipping") {
      if (!validateShipping()) return;
      window.scrollTo({ top: 0, behavior: "smooth" });
      setOrderStep("payment");
      return;
    }

    // STEP 2 — payment & order
    try {
      const orderPayload = {
        orderItems: cartItems.map((i) => ({
          qty: i.qty,
          product: i._id,
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.zipCode,
          country: "India",
        },
        paymentMethod: paymentMethod === "cod" ? "COD" : "RAZORPAY",
      };
      setPlacingOrder(true);
      if (paymentMethod === "cod") {
        await api.post("/orders", orderPayload);
        dispatch(clearCart());
        toastSuccess("Order Placed Successfully!");
        setTimeout(() => navigate("/"), 2800);
        return;
      }

      // The persisted attempt is reused only when its normalized cart and delivery
      // payload are identical. It is never proof of reservation ownership.
      const paymentAttempt = getOrCreateRazorpayAttempt(orderPayload);
      const { data: paymentOrder } = await api.post("/orders/payment-order", orderPayload, {
        headers: { "Idempotency-Key": paymentAttempt.idempotencyKey },
      });
      await loadRazorpay();
      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency || "INR",
          order_id: paymentOrder.razorpayOrderId,
          name: "Shreeji Store",
          description: "Order payment",
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            contact: formData.phone,
          },
          handler: async (response) => {
            try {
              await api.post("/orders/verify-payment", {
                localOrderId: paymentOrder.localOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              clearRazorpayAttempt();
              dispatch(clearCart());
              toastSuccess("Payment successful. Order placed!");
              setTimeout(() => navigate("/"), 2800);
              resolve();
            } catch (error) {
              reject(new Error(error.response?.data?.message || "Payment verification failed"));
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment was cancelled. Your cart is still saved.")),
          },
          theme: { color: "#111111" },
        });
        checkout.on("payment.failed", (response) => reject(new Error(response.error?.description || "Payment failed")));
        checkout.open();
      });
    } catch (error) {
      const responseMessage = error.response?.data?.message;
      if (error.response?.status === 409 && responseMessage === "This item is currently unavailable. Please try again shortly.") {
        showCheckoutError("This item is currently unavailable. Please try again shortly.");
      } else {
        showCheckoutError(responseMessage || error.message || "Something went wrong. Please try again.");
      }
      if (
        error.response?.status === 409 &&
        responseMessage !== "This item is currently unavailable. Please try again shortly."
      ) {
        // A completed, released, or payload-conflicting attempt cannot be retried.
        // The next deliberate checkout submission receives a fresh key.
        clearRazorpayAttempt();
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  const inputClassName = "w-full rounded-xl border border-[#A8C7F0]/35 bg-[#FFFAF3] px-4 py-3 text-sm text-[#382A3A] outline-none transition-colors placeholder:text-[#382A3A]/40 focus:border-[#557cae] focus:ring-2 focus:ring-[#A8C7F0]/45";
  const paymentOptions = [
    { value: "cod", title: "Cash on Delivery", description: "Pay when your order arrives", icon: Banknote, logos: [] },
    {
      value: "card",
      title: "Credit or debit card",
      description: "Pay securely through Razorpay",
      icon: CreditCard,
      logos: [
        { name: "Visa", src: "/assets/payment/visa.svg" },
        { name: "Mastercard", src: "/assets/payment/mastercard.svg" },
        { name: "RuPay", src: "/assets/payment/rupay.png" },
      ],
    },
    {
      value: "upi",
      title: "UPI or mobile banking",
      description: "Use your preferred UPI app at Razorpay",
      icon: Smartphone,
      logos: [
        { name: "Google Pay", src: "/assets/payment/google-pay.svg" },
        { name: "PhonePe", src: "/assets/payment/phonepe.svg" },
        { name: "Paytm", src: "/assets/payment/paytm.svg" },
        { name: "BHIM UPI", src: "/assets/payment/bhim.png" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFAF3] text-[#382A3A]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-6 md:pt-36 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-[#A8C7F0]/25 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => navigate("/cart")} className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#382A3A]/70 transition-colors hover:text-[#382A3A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C7F0]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to bag
          </button>
          <ol aria-label="Checkout progress" className="flex items-center justify-between gap-2 text-xs sm:justify-end sm:gap-4 sm:text-sm">
            {[
              { label: "Delivery", complete: orderStep === "payment", current: orderStep === "shipping" },
              { label: "Payment", complete: false, current: orderStep === "payment" },
              { label: "Confirmation", complete: false, current: false },
            ].map((step, index) => (
              <li key={step.label} className="flex items-center gap-2">
                {index > 0 && <span className={`hidden h-px w-5 sm:block ${step.complete || step.current ? "bg-[#A8C7F0]" : "bg-[#382A3A]/15"}`} aria-hidden="true" />}
                <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${step.complete ? "border-[#A8C7F0] bg-[#A8C7F0] text-[#382A3A]" : step.current ? "border-[#382A3A] bg-[#382A3A] text-[#FFFAF3]" : "border-[#A8C7F0]/45 text-[#382A3A]/50"}`}>
                  {step.complete ? <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> : index + 1}
                </span>
                <span className={step.current ? "font-semibold text-[#382A3A]" : "text-[#382A3A]/55"}>{step.label}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <section>
            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#A8C7F0]/30 bg-white/30 p-5 sm:p-7">
                {formError && (
                  <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </p>
                )}

                {orderStep === "shipping" && (
                  <>
                    <p className="mb-2 text-xs font-medium text-[#382A3A]/55">Step 1 of 3</p>
                    <h1 className="text-3xl text-[#382A3A] sm:text-4xl">Delivery details</h1>
                    <p className="mt-3 text-sm leading-6 text-[#382A3A]/65">Where should we send your Shreeji order?</p>
                    <div className="mt-7 grid gap-4 sm:grid-cols-2">
                      <input name="firstName" placeholder="First name" value={formData.firstName} onChange={handleInputChange} className={inputClassName} required />
                      <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} className={inputClassName} required />
                      <input name="email" type="email" placeholder="Email address" value={formData.email} onChange={handleInputChange} className={`${inputClassName} sm:col-span-2`} required />
                      <input name="phone" placeholder="Phone number" value={formData.phone} onChange={handleInputChange} className={`${inputClassName} sm:col-span-2`} required />
                      <input name="address" placeholder="Full address" value={formData.address} onChange={handleInputChange} className={`${inputClassName} sm:col-span-2`} required />
                      <input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className={inputClassName} required />
                      <input name="state" placeholder="State" value={formData.state} onChange={handleInputChange} className={inputClassName} required />
                      <input name="zipCode" placeholder="ZIP code" value={formData.zipCode} onChange={handleInputChange} className="sm:col-span-2 w-full rounded-xl border border-[#A8C7F0]/35 bg-[#FFFAF3] px-4 py-3 text-sm text-[#382A3A] outline-none transition-colors placeholder:text-[#382A3A]/40 focus:border-[#557cae] focus:ring-2 focus:ring-[#A8C7F0]/45" required />
                    </div>
                  </>
                )}

                {orderStep === "payment" && (
                  <>
                    <p className="mb-2 text-xs font-medium text-[#382A3A]/55">Step 2 of 3</p>
                    <h1 className="text-3xl text-[#382A3A] sm:text-4xl">Choose payment</h1>
                    <p className="mt-3 text-sm leading-6 text-[#382A3A]/65">Select how you would like to pay for your order</p>
                    <fieldset className="mt-7 space-y-3">
                      <legend className="sr-only">Payment method</legend>
                      {paymentOptions.map(({ value, title, description, icon: Icon, logos }) => (
                        <label key={value} className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${paymentMethod === value ? "border-[#557cae] bg-[#A8C7F0]/20" : "border-[#A8C7F0]/35 bg-[#FFFAF3] hover:border-[#557cae]/55"}`}>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#A8C7F0] text-[#382A3A]">{createElement(Icon, { className: "h-5 w-5", strokeWidth: 1.5, "aria-hidden": true })}</span>
                          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#382A3A]">{title}</span><span className="mt-1 block text-xs leading-5 text-[#382A3A]/60">{description}</span>{logos.length > 0 && <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">{logos.map((logo) => <img key={logo.name} src={logo.src} alt={logo.name} title={logo.name} className="h-4 w-auto max-w-12 object-contain" />)}</span>}</span>
                          <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={(event) => setPaymentMethod(event.target.value)} className="h-4 w-4 shrink-0 accent-[#557cae]" />
                        </label>
                      ))}
                    </fieldset>
                  </>
                )}

                <div className="mt-8 flex flex-col gap-3 border-t border-[#A8C7F0]/25 pt-6 sm:flex-row">
                  {orderStep === "payment" && (
                    <button
                      type="button"
                      onClick={() => setOrderStep("shipping")}
                      disabled={placingOrder}
                      className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#A8C7F0]/40 bg-[#FFFAF3] px-4 text-sm font-semibold text-[#382A3A] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C7F0]"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to delivery
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={placingOrder}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#A8C7F0] px-4 text-sm font-semibold text-[#382A3A] transition-colors hover:bg-[#8FB8EC] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#382A3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFAF3]"
                  >
                    {placingOrder
                      ? "Processing..."
                      : orderStep === "shipping"
                      ? "Continue to Payment"
                      : "Place Order"}
                    {!placingOrder && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </form>
          </section>

          <aside aria-labelledby="order-summary-heading" className="xl:sticky xl:top-28">
            <section className="rounded-2xl border border-[#A8C7F0]/35 bg-white/45 p-5 shadow-[0_12px_32px_rgba(56,42,58,0.06)] sm:p-6">
              <div className="flex items-center justify-between">
                <h2 id="order-summary-heading" className="text-xl text-[#382A3A]">Order summary</h2>
                <ShoppingBag className="h-5 w-5 text-[#382A3A]/55" strokeWidth={1.5} aria-hidden="true" />
              </div>

              <ul className="mt-6 max-h-72 space-y-4 overflow-y-auto pr-1">
                {cartItems.map((item) => <li key={`${item._id}-${item.size || "default"}`} className="flex gap-3"><img src={item.image} alt={item.name} className="h-16 w-14 rounded-lg bg-[#FFFAF3] object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#382A3A]">{item.name}</p><p className="mt-1 text-xs text-[#382A3A]/60">{item.size ? `Size ${item.size}` : "One size"} · Qty {item.qty}</p><p className="mt-2 text-sm font-medium tabular-nums text-[#382A3A]">₹{Number(item.price * item.qty).toLocaleString("en-IN")}</p></div></li>)}
              </ul>

              <div className="mt-6 border-y border-[#A8C7F0]/25 py-5">
                <label htmlFor="checkout-promo-code" className="mb-2 flex items-center gap-2 text-sm font-medium text-[#382A3A]"><Tag className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />Promo code</label>
                <div className="flex gap-2"><input id="checkout-promo-code" type="text" placeholder="Enter code" disabled className="min-w-0 flex-1 rounded-lg border border-[#A8C7F0]/35 bg-[#FFFAF3] px-3 py-2.5 text-sm text-[#382A3A] outline-none placeholder:text-[#382A3A]/40 disabled:cursor-not-allowed disabled:opacity-70" /><button type="button" disabled className="rounded-lg border border-[#A8C7F0]/40 px-3 text-sm font-semibold text-[#382A3A]/55 disabled:cursor-not-allowed">Apply</button></div>
                <p className="mt-2 text-xs text-[#382A3A]/55">Promo codes are not available for this order</p>
              </div>

              <dl className="space-y-3 border-b border-[#A8C7F0]/25 py-5 text-sm">
                <div className="flex justify-between gap-4 text-[#382A3A]/65"><dt>Subtotal</dt><dd className="font-medium tabular-nums text-[#382A3A]">₹{subtotal.toLocaleString("en-IN")}</dd></div>
                <div className="flex justify-between gap-4 text-[#382A3A]/65"><dt>Discount</dt><dd className="font-medium tabular-nums text-[#382A3A]">₹0</dd></div>
                <div className="flex justify-between gap-4 text-[#382A3A]/65"><dt>Shipping</dt><dd className="font-medium text-[#382A3A]">{shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}</dd></div>
                <div className="flex justify-between gap-4 text-[#382A3A]/65"><dt>Tax</dt><dd className="font-medium tabular-nums text-[#382A3A]">₹{tax.toLocaleString("en-IN")}</dd></div>
              </dl>

              <div className="flex items-end justify-between gap-4 py-5"><div><p className="text-sm font-medium text-[#382A3A]">Total payable</p><p className="mt-1 text-xs text-[#382A3A]/55">Including taxes</p></div><p className="text-2xl font-semibold tabular-nums text-[#382A3A]">₹{total.toLocaleString("en-IN")}</p></div>
              <div className="flex items-start gap-2 border-t border-[#A8C7F0]/20 pt-4 text-xs leading-5 text-[#382A3A]/60"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" /><p>Your payment details are handled securely</p></div>
            </section>
            <div className="mt-4 flex items-center gap-2 px-1 text-xs text-[#382A3A]/60"><Truck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />Free delivery on this order</div>
          </aside>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default CheckoutPage;
