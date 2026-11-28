import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  LockKeyhole,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import { updateCartItem, removeCartItem } from "../Redux/Slices/cartSlice";
import Navbar from "../components/Navbar";
import cartIllustration from "../assets/cart.png";

const MAX_QUANTITY = 10;

const CartPage = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const [pendingItem, setPendingItem] = useState("");
  const [actionError, setActionError] = useState("");

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0,
  );
  const tax = Math.round(subtotal * 0.1);
  const shipping = subtotal > 5000 ? 0 : 150;
  const total = subtotal + tax + shipping;
  const itemCount = cartItems.reduce((count, item) => count + item.qty, 0);

  const itemKey = (item) => `${item._id}-${item.size || "default"}`;

  const handleUpdateQty = async (item, newQty) => {
    if (
      newQty < 1 ||
      newQty > MAX_QUANTITY ||
      (Number.isFinite(item.countInStock) && newQty > item.countInStock)
    ) return;
    const key = itemKey(item);
    setActionError("");
    setPendingItem(key);
    try {
      await dispatch(updateCartItem({ productId: item._id, size: item.size, qty: newQty }));
    } catch (error) {
      setActionError(error.userMessage || "We couldn't update this item. Please try again.");
    } finally {
      setPendingItem("");
    }
  };

  const handleRemove = async (item) => {
    const key = itemKey(item);
    setActionError("");
    setPendingItem(key);
    try {
      await dispatch(removeCartItem({ productId: item._id, size: item.size }));
    } catch (error) {
      setActionError(error.userMessage || "We couldn't remove this item. Please try again.");
    } finally {
      setPendingItem("");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFAF3] text-[#382A3A]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-6 md:pt-36 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#382A3A]/55 sm:text-sm">
          <Link to="/" className="transition-colors hover:text-[#382A3A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C7F0]">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span aria-current="page" className="text-[#382A3A]/75">Shopping Cart</span>
        </nav>

        {cartItems.length === 0 ? (
          <section className="mx-auto flex min-h-[calc(100vh-15rem)] max-w-lg flex-col items-center justify-center py-12 text-center">
            <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#A8C7F0]/35 bg-white/45 shadow-[0_10px_28px_rgba(56,42,58,0.06)]">
              <ShoppingBag className="h-9 w-9 text-[#382A3A]" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <img src={cartIllustration} alt="" className="mb-7 w-52 max-w-full object-contain sm:w-60" />
            <h1 className="text-3xl text-[#382A3A] sm:text-4xl">Your bag is empty</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#382A3A]/65">
              Discover Shreeji pieces chosen for your everyday wardrobe
            </p>
            <Link to="/" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#A8C7F0] px-6 text-sm font-semibold text-[#382A3A] transition-colors hover:bg-[#8FB8EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#382A3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFAF3]">
              Continue shopping <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        ) : (
          <>
            <header className="mb-8 mt-7 flex flex-wrap items-end justify-between gap-3 sm:mb-10">
              <div>
                <p className="mb-2 text-xs font-medium text-[#382A3A]/55">Your selection</p>
                <h1 className="text-3xl text-[#382A3A] sm:text-4xl">Shopping Bag</h1>
              </div>
              <p className="pb-1 text-sm text-[#382A3A]/65">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            </header>

            {actionError && (
              <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </p>
            )}

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
              <section aria-labelledby="bag-items-heading" className="overflow-hidden rounded-2xl border border-[#A8C7F0]/30 bg-white/30">
                <div className="flex items-center justify-between border-b border-[#A8C7F0]/25 px-5 py-5 sm:px-6">
                  <h2 id="bag-items-heading" className="text-xl text-[#382A3A]">Items in your bag</h2>
                  <Link to="/" className="text-sm font-medium text-[#382A3A]/70 underline-offset-4 transition-colors hover:text-[#382A3A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C7F0]">Continue shopping</Link>
                </div>

                <ul className="divide-y divide-[#A8C7F0]/25">
                  {cartItems.map((item) => {
                    const key = itemKey(item);
                    const isPending = pendingItem === key;
                    const hasSize = Boolean(item.size);
                    const maxAllowedQuantity = Number.isFinite(item.countInStock)
                      ? Math.min(MAX_QUANTITY, item.countInStock)
                      : MAX_QUANTITY;

                    return (
                      <li key={key} className="p-5 sm:p-6">
                        <article className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 sm:grid-cols-[136px_minmax(0,1fr)] sm:gap-6">
                          <Link to={`/product/${item._id}`} className="block overflow-hidden rounded-xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C7F0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFAF3]">
                            <img src={item.image} alt={item.name} className="aspect-[4/5] h-full w-full object-cover" />
                          </Link>

                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="mb-1 text-xs font-medium text-[#382A3A]/55">Apparel</p>
                                <Link to={`/product/${item._id}`} className="line-clamp-2 text-base font-semibold leading-5 text-[#382A3A] transition-colors hover:text-[#557cae] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C7F0] sm:text-lg">
                                  {item.name}
                                </Link>
                              </div>
                              <button type="button" onClick={() => handleRemove(item)} disabled={isPending} className="-mr-2 -mt-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#382A3A]/55 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C7F0]" aria-label={`Remove ${item.name}`}>
                                <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                              </button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#382A3A]/70">
                              {hasSize && <span className="rounded-md border border-[#A8C7F0]/35 bg-[#FFFAF3] px-2.5 py-1">Size {item.size}</span>}
                              {!hasSize && <span className="rounded-md border border-[#A8C7F0]/35 bg-[#FFFAF3] px-2.5 py-1">One size</span>}
                              {Number.isFinite(item.countInStock) && item.countInStock > 0 && item.countInStock <= 5 && <span className="rounded-md border border-[#A8C7F0]/35 bg-[#FFFAF3] px-2.5 py-1">Only {item.countInStock} left</span>}
                            </div>

                            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                              <div>
                                <p className="text-base font-semibold tabular-nums text-[#382A3A]">₹{Number(item.price).toLocaleString("en-IN")}</p>
                                <p className="mt-1 text-xs text-[#382A3A]/55">₹{Number(item.price * item.qty).toLocaleString("en-IN")} for {item.qty}</p>
                              </div>

                              <div className="flex items-center rounded-lg border border-[#A8C7F0]/40 bg-[#FFFAF3] p-1" aria-label={`Quantity for ${item.name}`}>
                                <button type="button" onClick={() => handleUpdateQty(item, item.qty - 1)} disabled={isPending || item.qty <= 1} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#382A3A] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C7F0]" aria-label="Decrease quantity">
                                  <Minus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
                                <button type="button" onClick={() => handleUpdateQty(item, item.qty + 1)} disabled={isPending || item.qty >= maxAllowedQuantity} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#382A3A] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C7F0]" aria-label="Increase quantity">
                                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <aside aria-labelledby="order-summary-heading" className="xl:sticky xl:top-28">
                <section className="rounded-2xl border border-[#A8C7F0]/35 bg-white/45 p-5 shadow-[0_12px_32px_rgba(56,42,58,0.06)] sm:p-6">
                  <div className="flex items-center justify-between">
                    <h2 id="order-summary-heading" className="text-xl text-[#382A3A]">Order summary</h2>
                    <ShoppingBag className="h-5 w-5 text-[#382A3A]/55" strokeWidth={1.5} aria-hidden="true" />
                  </div>

                  <div className="mt-6 border-b border-[#A8C7F0]/25 pb-6">
                    <label htmlFor="promo-code" className="mb-2 flex items-center gap-2 text-sm font-medium text-[#382A3A]"><Tag className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />Promo code</label>
                    <div className="flex gap-2">
                      <input id="promo-code" type="text" placeholder="Enter code" disabled className="min-w-0 flex-1 rounded-lg border border-[#A8C7F0]/35 bg-[#FFFAF3] px-3 py-2.5 text-sm text-[#382A3A] outline-none placeholder:text-[#382A3A]/40 disabled:cursor-not-allowed disabled:opacity-70" />
                      <button type="button" disabled className="rounded-lg border border-[#A8C7F0]/40 px-3 text-sm font-semibold text-[#382A3A]/55 disabled:cursor-not-allowed">Apply</button>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[#382A3A]/55">Promo codes are not available for this order</p>
                  </div>

                  <dl className="space-y-3 border-b border-[#A8C7F0]/25 py-6 text-sm">
                    <div className="flex items-center justify-between gap-4 text-[#382A3A]/65"><dt>Subtotal</dt><dd className="font-medium tabular-nums text-[#382A3A]">₹{subtotal.toLocaleString("en-IN")}</dd></div>
                    <div className="flex items-center justify-between gap-4 text-[#382A3A]/65"><dt>Shipping</dt><dd className="font-medium text-[#382A3A]">{shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}</dd></div>
                    <div className="flex items-center justify-between gap-4 text-[#382A3A]/65"><dt>Tax</dt><dd className="font-medium tabular-nums text-[#382A3A]">₹{tax.toLocaleString("en-IN")}</dd></div>
                  </dl>

                  <div className="flex items-end justify-between gap-4 py-5">
                    <div><p className="text-sm font-medium text-[#382A3A]">Total</p><p className="mt-1 text-xs text-[#382A3A]/55">Including taxes and shipping</p></div>
                    <p className="text-2xl font-semibold tabular-nums text-[#382A3A]">₹{total.toLocaleString("en-IN")}</p>
                  </div>

                  <Link to="/checkout" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#A8C7F0] px-4 text-sm font-semibold text-[#382A3A] transition-colors hover:bg-[#8FB8EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#382A3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFAF3]">
                    Continue to checkout <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>

                  <div className="mt-4 flex items-start gap-2 border-t border-[#A8C7F0]/20 pt-4 text-xs leading-5 text-[#382A3A]/60">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#382A3A]/65" strokeWidth={1.5} aria-hidden="true" />
                    <p>Secure checkout with your preferred payment method</p>
                  </div>
                </section>

                <div className="mt-4 flex items-center gap-2 px-1 text-xs text-[#382A3A]/60"><Truck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />{shipping === 0 ? "Your order qualifies for free shipping" : "Shipping is calculated from your current bag"}</div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CartPage;
