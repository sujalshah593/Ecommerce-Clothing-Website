import {
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, Suspense, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import { fetchProducts, resetProducts } from "../Redux/Slices/productSlice.js";
import TruckLoader from "../components/TruckLoader.jsx";
import Navbar from "../components/Navbar.jsx";
import boyspage from "../assets/boyspage.avif"; // <-- add hero image

const BoysContent = () => {
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [page, setPage] = useState(1);

  const dispatch = useDispatch();
  const fetchedPages = useRef(new Set());

  const { products, loading, error, pages } = useSelector(
    (state) => state.products
  );

  const boysProducts = [...products]
    .filter((p) => p.targetGroup === "Boys")
    .sort((a, b) => {
      switch (sortBy) {
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  // Reset when page loads
  useEffect(() => {
    dispatch(resetProducts());
    fetchedPages.current.clear();
    setPage(1);
  }, [dispatch]);

  // Fetch products
  useEffect(() => {
    if (!fetchedPages.current.has(page)) {
      fetchedPages.current.add(page);
      dispatch(fetchProducts({ page, targetGroup: "Boys" }));
    }
  }, [dispatch, page]);

  // Close dropdown
  useEffect(() => {
    const close = () => setSortOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="min-h-screen font-sans bg-[#FAFAF8]">

      <Navbar />

      <main className="pt-32 md:pt-48">

        {/* ================= HERO SECTION ================= */}
        <section className="w-full">
          <div className="grid grid-cols-1  h-[60vh]">

            {/* LEFT SIDE IMAGE */}
            <div className="relative overflow-hidden">
              <img
                src={boyspage}
                alt="Boys Collection"
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-[#111111]/40"></div>

              {/* Text */}
              <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-16 text-[#FFFFFF]">
                <span className="text-[11px] text tracking-[0.4em] uppercase font-semibold mb-4 text-[#FFFFFF]/80">
                  Collection
                </span>

                <h1 className="text-5xl text md:text-7xl font-serif leading-[0.9] tracking-tight">
                  Boys <br />
                  <span className=" font-light">Essentials</span>
                </h1>

                <p className="mt-6 text max-w-md text-sm md:text-base text-[#FFFFFF]/80 leading-relaxed">
                  Comfortable, stylish and durable pieces crafted for every occasion.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ================= FILTER BAR ================= */}
        <section className="sticky top-[60px] z-40 bg-[#FAFAF8] border-b px-6 md:px-12 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">

            <div className="flex items-center gap-6">
              <button className="flex text items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSortOpen(!sortOpen);
                }}
                className="flex text hover:bg-[#EAEAEA]/20 p-3 hover:cursor-pointer items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              >
                Sort By
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    sortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {sortOpen && (
                <div className="absolute text right-0 mt-3 w-48 bg-[#FAFAF8] border shadow-lg text-[10px] uppercase font-bold tracking-widest">
                  {[
                    { label: "Default", value: "default" },
                    { label: "Price: Low to High", value: "priceAsc" },
                    { label: "Price: High to Low", value: "priceDesc" },
                    { label: "Name: A to Z", value: "nameAsc" },
                    { label: "Name: Z to A", value: "nameDesc" },
                    { label: "Newest First", value: "newest" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 hover:bg-[#EAEAEA]/20"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= PRODUCTS ================= */}
        <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">

          {loading && <TruckLoader />}
          {error && <p className="text-[#B76E4D]">{error}</p>}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-16 md:gap-x-8">
            {boysProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {page < pages && (
            <div className="flex justify-center mt-16">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

const BoysPage = () => (
  <Suspense fallback={null}>
    <BoysContent />
  </Suspense>
);

export default BoysPage;
