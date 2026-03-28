import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../Redux/Slices/cartSlice.js";
import api from "../api/axios.js";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection.jsx";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toastSuccess } from "../utils/toast.js";
import { Trash } from "lucide-react";
import { toast } from "react-toastify";
import Lottie from "lottie-react";
import orderProcessing from "../animations/orderProcessing.json";
import { useEffect } from "react";
import visa from "../assets/visa.png";
import rupay from "../assets/rupay.png";
import gpay from "../assets/gpay.png";
import bhim from "../assets/bhim.png";
import phonepe from "../assets/phonepe.png";


const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

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
          name: i.name,
          qty: i.qty,
          image: i.image,
          price: i.price,
          product: i._id,
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.zipCode,
          country: "India",
        },
        totalPrice: total,
      };
      setPlacingOrder(true);
      await api.post("/orders", orderPayload);

      dispatch(clearCart());
      toastSuccess("Order Placed Successfully!");
      setTimeout(() => {
        setPlacingOrder(false);
        navigate("/");
      }, 2800);
    } catch (error) {
      console.error("Checkout error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
        {
          position: "top-right",
          autoClose: 2000,
        },
      );
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-12">
            <Link
              to="/cart"
              className="text-sm text text-black font-serif hover:text-black transition"
            >
              ← Back to Cart
            </Link>

            <h1 className="font-serif text-4xl tracking-wide text1">
              Checkout
            </h1>

            {/* spacer to keep title centered */}
            <div className="w-24"></div>
          </div>
          <div className="flex text gap-8 mb-12 font-serif">
            {["shipping", "payment"].map((step, i) => (
              <div
                key={step}
                className={`flex flex-col items-center ${
                  orderStep === step ? "text-black" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 text1 rounded-full border flex items-center justify-center mb-2 ${
                    orderStep === step
                      ? "border-black bg-black/10"
                      : "border-gray-300"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-sm capitalize">{step}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 font-serif lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {formError && (
                  <p className="text-sm text-red-500 tracking-wide">
                    {formError}
                  </p>
                )}

                {orderStep === "shipping" && (
                  <>
                    <h2 className="font-serif text1 text-2xl mb-6">
                      Shipping Address
                    </h2>

                    <div className="grid text grid-cols-2 gap-4">
                      <input
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="border px-4 py-3"
                        required
                      />
                      <input
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="border px-4 py-3"
                        required
                      />
                    </div>

                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border text px-4 py-3 w-full"
                      required
                    />

                    <input
                      name="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="border text px-4 py-3 w-full"
                      required
                    />

                    <input
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="border text px-4 py-3 w-full"
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="border text px-4 py-3"
                        required
                      />
                      <input
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="border text px-4 py-3"
                        required
                      />
                    </div>

                    <input
                      name="zipCode"
                      placeholder="ZIP Code"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="border text px-4 py-3 w-full"
                      required
                    />
                  </>
                )}

                {orderStep === "payment" && (
                  <>
                    <h2 className="font-serif text text-2xl mb-6">
                      Select Payment Method
                    </h2>

                    <div className="space-y-5 text">
                      {/* CARD OPTION */}
                      <label className="border text p-5 cursor-pointer hover:border-black transition block">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="payment"
                              value="card"
                              checked={paymentMethod === "card"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span className="font-medium">
                              Credit / Debit Card
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <img
                              src={visa}
                              alt="Visa"
                              className="h-6 object-contain"
                            />
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                              alt="Mastercard"
                              className="h-6 object-contain"
                            />
                            <img
                              src={rupay}
                              alt="RuPay"
                              className="h-6 object-contain"
                            />
                          </div>
                        </div>
                      </label>

                      {/* UPI OPTION */}
                      <label className="border p-5 cursor-pointer hover:border-black transition block">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="payment"
                              value="upi"
                              checked={paymentMethod === "upi"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span className="font-medium">UPI Payments</span>
                          </div>

                          <div className="flex items-center gap-4">
                            <img
                              src={gpay}
                              alt="Google Pay"
                              className="h-6 object-contain"
                            />
                            <img
                              src={bhim}
                              alt="BHIM"
                              className="h-6 object-contain"
                            />
                            <img
                              src={phonepe}
                              alt="PhonePe"
                              className="h-6 object-contain"
                            />
                          </div>
                        </div>
                      </label>

                      {/* COD OPTION */}
                      <label className="border p-5 cursor-pointer hover:border-black transition block">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="payment"
                              value="cod"
                              checked={paymentMethod === "cod"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span className="font-medium">
                              Cash on Delivery
                            </span>
                          </div>

                          <span className="text-xs text-gray-500">
                            Pay at doorstep
                          </span>
                        </div>
                      </label>
                    </div>

                    <p className="mt-6 text-sm text text-gray-500">
                      🔒 All transactions are secured and encrypted.
                    </p>
                  </>
                )}

                <div className="flex gap-4 pt-8">
                  {orderStep === "payment" && (
                    <button
                      type="button"
                      onClick={() => setOrderStep("shipping")}
                      className="flex-1 text1 border py-3"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 text1 bg-black text-white py-3 uppercase tracking-wider"
                  >
                    {orderStep === "shipping"
                      ? "Continue to Payment"
                      : "Place Order"}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-100 p-8 sticky top-24">
                <h2 className="font-serif font-bold text-xl text1 mb-6">
                  Order Summary
                </h2>

                {/* PRODUCTS LIST */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 border-b pb-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-16 object-cover"
                      />

                      <div className="flex-1">
                        <p className="text-sm font-medium text1">{item.name}</p>

                        {item.size && (
                          <p className="text-xs text text-gray-500">
                            Size: {item.size}
                          </p>
                        )}

                        <p className="text-xs text text-gray-500">
                          Qty: {item.qty}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text1">
                        ₹{item.qty * item.price}
                      </p>
                    </div>
                  ))}
                </div>

                {/* PRICE DETAILS */}
                <div className="space-y-3 text mb-6 font-serif">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{tax}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-red-500">FREE</span>
                  </div>
                </div>

                <div className="border-t text1 font-serif pt-4 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl">₹{total}</span>
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
