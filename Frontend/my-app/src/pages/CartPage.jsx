import { useDispatch, useSelector } from "react-redux";
import {
  updateQty,
  removeFromCart,
  addToCart,
} from "../Redux/Slices/cartSlice";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import FooterSection from "../components/FooterSection";
import { Minus, Plus, Trash, X, Info, Send } from "lucide-react";
import Navbar from "../components/Navbar";
import cart from '../assets/cart.png'

const CartPage = () => {
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);
  const { products } = useSelector((state) => state.products);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0,
  );
  const tax = Math.round(subtotal * 0.1);
  const shipping = subtotal > 5000 ? 0 : 150;
  const total = subtotal + tax + shipping;

  const handleUpdateQty = (item, newQty) => {
    if (newQty < 1 || newQty > 10) return;
    dispatch(updateQty({ id: item._id, size: item.size, qty: newQty }));
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart({ id: item._id, size: item.size }));
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, size: product.sizes?.[0] || "" }));
  };

  return (
    <>
      <div className="min-h-screen bg-[#FFFAF3]">
        {/* <nav className="border-b sticky top-0 bg-[#FFFAF3]/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <Link to="/" className="font-serif text1 text-2xl tracking-wider">
            SHREÉJI
          </Link>
          <Link to="/" className="text-sm text text-[#6B7280] font-serif hover:text-[#111111]">
            Continue Shopping
          </Link>
        </div>
      </nav> */}
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-35 ">

          {cartItems.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center 
                min-h-[80vh] text-center font-serif"
            >
              <img src={cart} alt="Empty Cart" className="w-56 md:w-72 max-w-full h-auto object-contain mx-auto mb-4 opacity-90" />
              <h2 className="text-xl mt-9 text1 mb-1">
               Your cart is empty
              </h2>

              <p className="text-[#6B7280] text mb-8">
                Looks like you haven’t added anything yet.
              </p>

              <Link
                to="/"
                className="bg-[#A8C7F0] text-[#382A3A] px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#519cff] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT COLUMN: CART ITEMS */}
              <div className="lg:col-span-7 xl:col-span-8">
                <div className="bg-[#FFFAF3] rounded-3xl p-6 md:p-8 shadow-sm border border-[#A8C7F0]/20">
                  <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#382A3A]">
                    Shopping Cart
                  </h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={`${item._id}-${item.size}`}
                        className="border border-[#A8C7F0]/30 rounded-2xl p-4 flex gap-4 items-center relative transition hover:border-blue-400"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-24 md:w-24 md:h-24 object-cover rounded-xl bg-[#FFFAF3]"
                        />

                        <div className="flex-1">
                          <h3 className="text-xs md:text-sm font-medium text-blue-500 italic mb-1">
                            {item.category || "Apparel"}
                          </h3>
                          <h2 className="font-bold text-[#382A3A] text-base md:text-lg leading-tight mb-1">
                            {item.name}
                          </h2>
                          <p className="text-xs md:text-sm text-[#382A3A]/60">
                            Size: {item.size}
                          </p>
                          <p className="font-bold text-[#382A3A] mt-2">
                            ₹{item.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-col items-end justify-between self-stretch">
                          <button
                            onClick={() => handleRemove(item)}
                            className="text-[#382A3A]/40 hover:text-white hover:bg-red-500 p-2 mb-2 rounded-full transition-all flex items-center justify-center"
                            title="Delete Item"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                          <div className="flex items-center border border-[#A8C7F0]/30 rounded-full mt-auto bg-[#FFFAF3] shadow-sm">
                            <button
                              onClick={() => handleUpdateQty(item, item.qty - 1)}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-[#382A3A]/70 hover:bg-[#FFFAF3] rounded-full"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-5 md:w-6 text-center text-sm font-bold text-[#382A3A]">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(item, item.qty + 1)}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-[#382A3A]/70 hover:bg-[#FFFAF3] rounded-full"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: ORDER SUMMARY */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="bg-[#FFFAF3] rounded-3xl p-6 md:p-8 shadow-sm border border-[#A8C7F0]/20 sticky top-32 md:top-48">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-[#382A3A]">
                      Order Summary
                    </h2>
                    <Info className="w-5 h-5 text-[#382A3A]/40" />
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#382A3A] mb-3">
                      Promotion Code
                    </h3>
                    <div className="flex items-center border border-[#A8C7F0]/30 rounded-xl p-1 bg-[#FFFAF3] focus-within:border-blue-400 transition">
                      <input
                        type="text"
                        placeholder="Add Promo Code"
                        className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-[#382A3A] font-sans"
                      />
                      <button className="w-10 h-10 bg-[#A8C7F0] text-[#382A3A] rounded-lg flex items-center justify-center hover:bg-[#A8C7F0] transition">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <h3 className="text-sm font-semibold text-[#382A3A] mb-2">
                      Order Total
                    </h3>
                    <div className="flex justify-between text-sm text-[#382A3A]/60 font-medium">
                      <span>Subtotal</span>
                      <span className="text-[#382A3A]">
                        ₹{subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-[#382A3A]/60 font-medium">
                      <span>Shipping</span>
                      <span className="text-[#382A3A]">
                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-[#382A3A]/60 font-medium">
                      <span>Tax (10%)</span>
                      <span className="text-[#382A3A]">
                        ₹{tax.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#A8C7F0]/20 pt-4 mb-8 flex justify-between items-center">
                    <span className="font-bold text-[#382A3A] text-lg">Total</span>
                    <span className="font-bold text-[#1DA1F2] text-2xl">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#F5F8F2] border border-[#E3EDD9] rounded-xl p-4 mb-6">
                    <p className="text-[11px] text-[#382A3A]/70 text-center leading-relaxed">
                      Welcome to our Store. By proceeding, you agree to be bound by
                      these Terms and Conditions. Enjoy your shopping!
                    </p>
                  </div>

                  <Link
                    to="/checkout"
                    className="w-full bg-[#A8C7F0] text-[#382A3A] rounded-xl py-4 font-semibold hover:bg-[#A8C7F0] transition flex items-center justify-center shadow-md"
                  >
                    Continue to Review
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ADD MORE ITEMS */}
          {/* {products?.length > 0 && (
            <>
              <h2 className="text-xl mt-20 mb-6 text1">Add more items</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                {products.slice(0, 4).map((p) => (
                  <div key={p._id} className="relative">
                    <ProductCard product={p} />

                    <button
                      onClick={() => handleAddToCart(p)}
                      className="absolute left-3 right-3 mt-2 bg-[#A8C7F0] text-[#382A3A] rounded-full font-semibold py-3 text-center text-sm hover:bg-[#A8C7F0] transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </>
          )} */}
        </div>
      </div>
    </>
  );
};

export default CartPage;
