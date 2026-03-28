import { useDispatch, useSelector } from "react-redux";
import {
  updateQty,
  removeFromCart,
  addToCart,
} from "../Redux/Slices/cartSlice";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import FooterSection from "../components/FooterSection";
import { Delete, Minus, Plus, Trash } from "lucide-react";
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

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* <nav className="border-b sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <Link to="/" className="font-serif text1 text-2xl tracking-wider">
            SHREÉJI
          </Link>
          <Link to="/" className="text-sm text text-gray-500 font-serif hover:text-black">
            Continue Shopping
          </Link>
        </div>
      </nav> */}
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 mt-20">

          {cartItems.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center 
                min-h-[80vh] text-center font-serif"
            >
              <img src={cart} alt="" />
              <h2 className="text-xl mt-9 text1 mb-1">
               Your cart is empty
              </h2>

              <p className="text-gray-500 text mb-8">
                Looks like you haven’t added anything yet.
              </p>

              <Link
                to="/"
                className="px-10 py-3 bg-black text-white 
               uppercase tracking-wider text text-sm 
               hover:scale-105 transition-all duration-300"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-6 pb-6 border-b">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-32 h-40 object-cover bg-gray-100"
                    />

                    <div className="flex-1">
                      <h3 className="font-serif text-lg mb-2 text1">
                        {item.name}
                      </h3>
                      <h3 className="text-sm text-gray-500 text">
                        Size: <b className="text-black text1">{item.size}</b>
                      </h3>

                      <p className="text-sm font-serif text-gray-500 text mb-4">
                        Price: <b className="text-black text1">₹{item.price}</b>
                      </p>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm text-gray-500 font-serif text">
                          Quantity
                        </span>
                        <div className="flex items-center border">
                          <button
                            onClick={() =>
                              item.qty > 1 &&
                              dispatch(
                                updateQty({ id: item._id, qty: item.qty - 1 }),
                              )
                            }
                            className="px-3 py-2 text-gray-500 hover:text-black"
                          >
                            <Minus />
                          </button>

                          <span className="px-4 py-2 text1 border-l border-r">
                            {item.qty}
                          </span>

                          <button
                            onClick={() =>
                              dispatch(
                                updateQty({
                                  id: item._id,
                                  qty: item.qty + 1,
                                }),
                              )
                            }
                            className="px-3 py-2 text-gray-500 hover:text-black"
                          >
                            <Plus />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="text-sm text hover:cursor-pointer  text-red-500 hover:underline"
                      >
                        <Trash className="hover:fill-red-500" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text1">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-100 p-8 sticky top-24">
                  <h2 className="font-serif text1 text-xl mb-8">
                    Order Summary
                  </h2>

                  <div className="space-y-4 text mb-8 font-serif">
                    <div className="flex  justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax (10%)</span>
                      <span>₹{tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                    </div>
                    {shipping === 0 && (
                      <p className="text-xs text-red-500">
                        Free shipping on orders over ₹5,000
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4 mb-8 text1 flex justify-between">
                    <span className="font-serif font-bold text1">Total</span>
                    <span className="font-serif text-xl">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    to="/checkout"
                    className="block font-serif text text-center w-full bg-black text-white py-3 uppercase tracking-wider"
                  >
                    Proceed to Checkout
                  </Link>

                  <Link
                    to="/"
                    className="block text text-center font-serif w-full mt-4 border py-3"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ADD MORE ITEMS */}
          {products?.length > 0 && (
            <>
              <h2 className="text-xl mt-20 mb-6 text1">Add more items</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                {products.slice(0, 4).map((p) => (
                  <div key={p._id} className="relative">
                    <ProductCard product={p} />

                    <button
                      onClick={() => dispatch(addToCart(p))}
                      className="absolute text  left-3  right-3 bg-black text-white text-xs mt-2  py-3 uppercase tracking-wider"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
