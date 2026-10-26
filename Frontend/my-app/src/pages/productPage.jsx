import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchProductById,
  resetProductsDetails,
} from "../Redux/Slices/productDetailSlice.js";
import Navbar from "../components/Navbar.jsx";
import { ShoppingBag, Heart, Wrench, IndianRupee, ShieldCheck, ChevronRight } from "lucide-react";
import { fetchProducts } from "../Redux/Slices/productSlice.js";
import ProductCard from "../components/ProductCard.jsx";
import FooterSection from "../components/FooterSection.jsx";
import ProductReviews from "../components/ProductReviews.jsx";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../Redux/Slices/cartSlice.js";
import TruckLoader from "../components/TruckLoader.jsx";
import { toast } from "react-toastify";
import { toggleFavorite } from "../Redux/Slices/favoriteSlice.js";

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const navigate = useNavigate();
  const { favorites } = useSelector((state) => state.favorite);
  const [selectedSize, setSelectedSize] = useState("");

  const { product, loading, error } = useSelector(
    (state) => state.productDetails,
  );

  const addToCartHandler = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    dispatch(addToCart({ ...product, size: selectedSize }));

    toast.success(`${product.name} added to cart`, {
      position: "top-right",
      autoClose: 1500,
    });
    navigate("/cart");
  };

  useEffect(() => {
    dispatch(fetchProductById(id));
    dispatch(fetchProducts({ page: 3 }));

    return () => {
      dispatch(resetProductsDetails());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-32 md:pt-48 text-center text-sm tracking-widest uppercase">
          <TruckLoader />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="pt-32 md:pt-48 text-center text-[#A8C7F0] text-sm tracking-widest">
          {error}
        </div>
      </>
    );
  }

  if (!product) return null;
  const otherProducts = products
    .filter((p) => p._id !== product?._id)
    .slice(0, 4);

  const isFavorite = favorites.find((p) => p._id === product._id);

  const toggleFavoriteHandler = () => {
    dispatch(toggleFavorite(product));

    if (isFavorite) {
      toast.info(`${product.name} removed from favorites`, {
        position: "top-right",
        autoClose: 1500,
      });
    } else {
      toast.success(`${product.name} added to favorites`, {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-28 md:pt-36 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* LEFT: IMAGE */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[3/4] bg-[#FFFFFF] border border-[#EAEAEA] shadow-sm overflow-hidden rounded-2xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1200ms]"
              />
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-40 space-y-8">
              {/* Title & Price */}
              <div className="space-y-3">
                <h1 className="text-4xl text1 md:text-5xl font-serif tracking-tight text-[#382A3A]">
                  {product.name}
                </h1>

                <p className="text-2xl font-light text text-[#382A3A]">₹{product.price}</p>
              </div>

              {/* Description */}
              <p className="text-sm text md:text-base text-[#382A3A]/80 leading-relaxed">
                {product.description}
              </p>

              {/* SIZE SELECTOR */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-[#382A3A]/70 font-semibold">Select Size</p>

                <div className="flex gap-2.5">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 rounded-xl border text-xs font-bold transition cursor-pointer
        ${
          selectedSize === size
            ? "bg-[#382A3A] text-white border-[#382A3A] shadow-xs"
            : "border-[#A8C7F0]/40 bg-white hover:border-[#A8C7F0] text-[#382A3A]"
        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock */}
              <p className="text-xs text uppercase tracking-widest text-[#382A3A]/70">
                Stock:{" "}
                <span
                  className={`font-bold ${
                    product.countInStock > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </p>

              {/* ACTIONS */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={addToCartHandler}
                  disabled={product.countInStock === 0}
                  className="w-full py-4 bg-[#A8C7F0] hover:bg-[#8FB8EC] text-[#382A3A] font-bold rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-40 shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>

                <button
                  onClick={toggleFavoriteHandler}
                  className="w-full py-4 border border-[#A8C7F0]/40 bg-white hover:bg-[#FFFAF3] text-[11px] font-bold uppercase tracking-wider text-[#382A3A] rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavorite ? "text-red-500 fill-red-500" : "text-[#382A3A]"
                    }`}
                  />
                  {isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}
                </button>
              </div>

              {/* ASSURED BADGES & SERVICES */}
              <div className="pt-6 border-t border-[#A8C7F0]/30">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {/* 7-day brand support */}
                  <div className="flex flex-col items-center group cursor-pointer p-2 rounded-2xl hover:bg-white/60 transition">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#A8C7F0]/40 shadow-xs flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <div className="w-8 h-8 rounded-full bg-[#A8C7F0]/25 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#382A3A] flex items-center justify-center gap-0.5 leading-tight">
                      7-day brand support <ChevronRight className="w-3 h-3 text-[#382A3A]/40 shrink-0" />
                    </span>
                  </div>

                  {/* Cash on Delivery */}
                  <div className="flex flex-col items-center group cursor-pointer p-2 rounded-2xl hover:bg-white/60 transition">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#A8C7F0]/40 shadow-xs flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <div className="w-8 h-8 rounded-full bg-[#A8C7F0]/25 flex items-center justify-center">
                        <IndianRupee className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#382A3A] flex items-center justify-center gap-0.5 leading-tight">
                      Cash on Delivery <ChevronRight className="w-3 h-3 text-[#382A3A]/40 shrink-0" />
                    </span>
                  </div>

                  {/* Flipkart / Brand Assured */}
                  <div className="flex flex-col items-center group cursor-pointer p-2 rounded-2xl hover:bg-white/60 transition">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#A8C7F0]/40 shadow-xs flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <div className="w-8 h-8 rounded-full bg-[#A8C7F0]/25 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#382A3A] flex items-center justify-center gap-0.5 leading-tight">
                      SHREEJI Assured <ChevronRight className="w-3 h-3 text-[#382A3A]/40 shrink-0" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS & DISCUSSION SECTION */}
        <ProductReviews productId={product._id} productName={product.name} />

        {/* YOU MAY ALSO LIKE */}
        <section className="mt-20 mb-16">
          <h2 className="text-2xl font-serif text1 mb-8 text-[#382A3A]">You may also like</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {otherProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      </main>

      <FooterSection />
    </>
  );
};

export default ProductPage;
