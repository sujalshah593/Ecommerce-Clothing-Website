import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../Redux/Slices/cartSlice.js";
import api from "../api/axios.js";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection.jsx";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toastSuccess } from "../utils/toast.js";
import { toast } from "react-toastify";
import visa from "../assets/visa.png";
import rupay from "../assets/rupay.png";
import gpay from "../assets/gpay.png";
import bhim from "../assets/bhim.png";
import phonepe from "../assets/phonepe.png";
import { Info, Send, CreditCard, Banknote, Smartphone } from "lucide-react";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [idempotencyKey, setIdempotencyKey] = useState(() => {
    const storageKey = "shreeji:checkout:idempotency-key";
    const existingKey = sessionStorage.getItem(storageKey);
    if (existingKey) return existingKey;
    const newKey = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(storageKey, newKey);
    return newKey;
  });

  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth || {});

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

      const { data: paymentOrder } = await api.post("/orders/payment-order", orderPayload, {
        headers: { "Idempotency-Key": idempotencyKey },
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
              sessionStorage.removeItem("shreeji:checkout:idempotency-key");
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
      if (error.response?.data?.code === "PAYMENT_ATTEMPT_EXPIRED") {
        const storageKey = "shreeji:checkout:idempotency-key";
        const newKey = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(storageKey, newKey);
        setIdempotencyKey(newKey);
      }
      console.error("Checkout error:", error.response?.data || error.message);
      showCheckoutError(error.response?.data?.message || error.message || "Something went wrong. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-48 pb-20">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/cart')}
              className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-400">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${orderStep === 'payment' ? 'bg-[#10B981]' : 'bg-[#111827]'}`}>
                  {orderStep === 'payment' ? '✓' : '1'}
                </div>
                <span className="text-gray-800">Delivery</span>
              </div>
              <div className={`w-8 h-px ${orderStep === 'payment' ? 'bg-[#10B981]' : 'bg-gray-300'}`}></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderStep === 'payment' ? 'bg-[#111827] text-white' : 'border border-gray-300'}`}>
                  2
                </div>
                <span className={orderStep === 'payment' ? 'text-gray-800' : ''}>Payment</span>
              </div>
            </div>
            <div className="w-20 hidden md:block"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 xl:col-span-8">
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
                {formError && (
                  <p className="text-sm text-red-500 mb-6 bg-red-50 p-3 rounded-xl border border-red-100">
                    {formError}
                  </p>
                )}

                {orderStep === "shipping" && (
                  <>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                      Delivery Details
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">Enter your shipping information to continue.</p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          name="firstName"
                          placeholder="First Name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="border border-gray-200 rounded-xl px-4 py-3 w-full outline-none focus:border-blue-400 transition"
                          required
                        />
                        <input
                          name="lastName"
                          placeholder="Last Name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="border border-gray-200 rounded-xl px-4 py-3 w-full outline-none focus:border-blue-400 transition"
                          required
                        />
                      </div>

                      <input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border border-gray-200 rounded-xl px-4 py-3 w-full outline-none focus:border-blue-400 transition"
                        required
                      />

                      <input
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="border border-gray-200 rounded-xl px-4 py-3 w-full outline-none focus:border-blue-400 transition"
                        required
                      />

                      <input
                        name="address"
                        placeholder="Full Address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="border border-gray-200 rounded-xl px-4 py-3 w-full outline-none focus:border-blue-400 transition"
                        required
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          name="city"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="border border-gray-200 rounded-xl px-4 py-3 w-full outline-none focus:border-blue-400 transition"
                          required
                        />
                        <input
                          name="state"
                          placeholder="State"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="border border-gray-200 rounded-xl px-4 py-3 w-full outline-none focus:border-blue-400 transition"
                          required
                        />
                      </div>

                      <input
                        name="zipCode"
                        placeholder="ZIP Code"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="border border-gray-200 rounded-xl px-4 py-3 w-full outline-none focus:border-blue-400 transition"
                        required
                      />
                    </div>
                  </>
                )}

                {orderStep === "payment" && (
                  <>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                      Payment Method Options
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">Pick a payment option to continue to review.</p>

                    <div className="space-y-4">
                      {/* COD OPTION */}
                      <label className={`border rounded-2xl p-5 cursor-pointer block transition ${paymentMethod === 'cod' ? 'border-[#1DA1F2] bg-[#F8FBFF]' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                              <Banknote className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">Cash on Delivery</span>
                                <span className="bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded-md">Popular</span>
                              </div>
                              <span className="text-sm text-gray-500">Pay when you receive your order.</span>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="payment"
                            value="cod"
                            checked={paymentMethod === "cod"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-5 h-5 accent-[#1DA1F2]"
                          />
                        </div>
                      </label>

                      {/* CARD OPTION */}
                      <label className={`border rounded-2xl p-5 cursor-pointer block transition ${paymentMethod === 'card' ? 'border-[#1DA1F2] bg-[#F8FBFF]' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                              <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 block">Credit / Debit Card</span>
                              <span className="text-sm text-gray-500">Accepted: Visa, Mastercard, RuPay.</span>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={paymentMethod === "card"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-5 h-5 accent-[#1DA1F2]"
                          />
                        </div>
                      </label>

                      {/* UPI OPTION */}
                      <label className={`border rounded-2xl p-5 cursor-pointer block transition ${paymentMethod === 'upi' ? 'border-[#1DA1F2] bg-[#F8FBFF]' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                              <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 block">Mobile Banking / UPI</span>
                              <span className="text-sm text-gray-500">Supported: GPay, PhonePe, BHIM.</span>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="payment"
                            value="upi"
                            checked={paymentMethod === "upi"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-5 h-5 accent-[#1DA1F2]"
                          />
                        </div>
                      </label>
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-4 border-t border-gray-100">
                  {orderStep === "payment" && (
                    <button
                      type="button"
                      onClick={() => setOrderStep("shipping")}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition"
                    >
                      Back to Delivery
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={placingOrder}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition text-center shadow-md"
                  >
                    {placingOrder
                      ? "Processing..."
                      : orderStep === "shipping"
                      ? "Continue to Payment"
                      : "Place Order"}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 sticky top-32 md:top-48">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
                  <Info className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-4 mb-6 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl bg-gray-50" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-[11px] font-medium text-[#1DA1F2] italic mb-0.5">{item.category || "Apparel"}</h3>
                            <h2 className="font-bold text-gray-800 text-sm leading-tight line-clamp-1">{item.name}</h2>
                          </div>
                        </div>
                        <p className="font-bold text-gray-600 mt-1 text-sm">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 rounded-md">x{item.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Promotion Code</h3>
                  <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-white focus-within:border-blue-400 transition">
                    <input type="text" placeholder="Add Promo Code" className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-gray-700 font-sans" />
                    <button className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Order Total</h3>
                  <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Shipping</span>
                    <span className="text-gray-900">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Tax (10%)</span>
                    <span className="text-gray-900">₹{tax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-lg">Total</span>
                  <span className="font-bold text-[#1DA1F2] text-2xl">₹{total.toLocaleString()}</span>
                </div>
                
                <div className="bg-[#F5F8F2] border border-[#E3EDD9] rounded-xl p-4">
                  <p className="text-[11px] text-gray-600 text-center leading-relaxed">
                    Welcome to our Store. By proceeding, you agree to be bound by these Terms and Conditions. Enjoy your shopping!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </>
  );
};

export default CheckoutPage;
