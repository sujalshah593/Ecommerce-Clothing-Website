import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchProductById,
  resetProductsDetails,
} from "../Redux/Slices/productDetailSlice.js";
import Navbar from "../components/Navbar.jsx";
import { ShoppingBag, Heart, Truck, ShieldCheck } from "lucide-react";
import { fetchProducts } from "../Redux/Slices/productSlice.js";
import ProductCard from "../components/ProductCard.jsx";
import FooterSection from "../components/FooterSection.jsx";
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
        <div className="pt-32 text-center text-sm tracking-widest uppercase">
          <TruckLoader />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="pt-32 text-center text-[#B76E4D] text-sm tracking-widest">
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

      <main className="pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* LEFT: IMAGE */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[3/4] bg-[#FFFFFF] border border-[#EAEAEA] shadow-sm overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1200ms]"
              />
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32 space-y-10">
              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl text1 md:text-6xl font-serif tracking-tight">
                  {product.name}
                </h1>

                <p className="text-2xl font-light text">₹{product.price}</p>
              </div>

              {/* Description */}
              <p className="text-sm text md:text-base text-[#111111] leading-relaxed">
                {product.description}
              </p>
              {/* SIZE SELECTOR */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest">Select Size</p>

                <div className="flex gap-3">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 border text-xs font-bold
        ${
          selectedSize === size
            ? "bg-[#111111] text-[#FFFFFF] border-[#111111]"
            : "border-[#EAEAEA]/30"
        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock */}
              <p className="text-xs text uppercase tracking-widest">
                Stock:{" "}
                <span
                  className={`font-bold ${
                    product.countInStock > 0 ? "text-green-600" : "text-[#B76E4D]"
                  }`}
                >
                  {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </p>

              {/* ACTIONS */}
              <div className="space-y-4 pt-4">
                <button
                  onClick={addToCartHandler}
                  disabled={product.countInStock === 0}
                  className="w-full py-5 text1 bg-[#111111] text-[#FFFFFF] text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all disabled:opacity-40 hover:bg-[#B76E4D] transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>

                <button
                  onClick={toggleFavoriteHandler}
                  className="w-full text1 py-5 border border-zinc-300 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavorite ? "text-pink-500 fill-pink-500" : "text-[#111111]"
                    }`}
                  />
                  {isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}
                </button>
              </div>

              {/* TRUST */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t">
                <div className="flex text items-center gap-3 text-xs uppercase tracking-widest">
                  <Truck className="w-4 h-4" />
                  Free Shipping
                </div>
                <div className="flex text items-center gap-3 text-xs uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>
        <section className="mt-24 mb-12">
          <h2 className="text-2xl font-serif text1 mb-8">You may also like</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
