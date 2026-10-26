import {
  SlidersHorizontal,
  ChevronDown,
  Check,
  Sparkles
} from "lucide-react";
import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import { fetchProducts, resetProducts } from "../Redux/Slices/productSlice.js";
import TruckLoader from "../components/TruckLoader.jsx";
import Navbar from "../components/Navbar.jsx";
import FooterSection from "../components/FooterSection.jsx";

const BoysContent = () => {
  const dispatch = useDispatch();

  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [page, setPage] = useState(1);

  const fetchedPages = useRef(new Set());

  const { products, loading, error, pages } = useSelector(
    (state) => state.products
  );

  // Extract unique categories available in the boys products
  const categories = useMemo(() => {
    const boysOnly = products.filter((p) => p.targetGroup === "Boys");
    const unique = Array.from(new Set(boysOnly.map((p) => p.category).filter(Boolean)));
    return ["ALL", ...unique];
  }, [products]);

  // Filter boys products by category + sorting
  const boysProducts = useMemo(() => {
    return [...products]
      .filter((p) => {
        const matchesTarget = p.targetGroup === "Boys";
        const matchesCat = selectedCategory === "ALL" || p.category === selectedCategory;
        return matchesTarget && matchesCat;
      })
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
  }, [products, selectedCategory, sortBy]);

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

  // Close dropdown on outside click
  useEffect(() => {
    const close = () => setSortOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const sortLabels = {
    default: "Featured / Default",
    priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low",
    nameAsc: "Name: A to Z",
    nameDesc: "Name: Z to A",
    newest: "Newest Arrivals",
  };

  return (
    <div className="min-h-screen font-sans bg-[#FFFAF3]">
      <Navbar />

      <main className="pt-28 md:pt-32">
        {/* Header Title & Controls Section */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-4 pb-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#A8C7F0]/25">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#382A3A]/70 mb-1">  
                Youth & Kids Edition
              </div>
              <h1 className="header text-3xl md:text-5xl uppercase tracking-tight text-[#382A3A]">
                Boys <span className="text-[#A8C7F0]">Collection</span>
              </h1>
            </div>

            {/* Filter tags & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Pills */}
              {categories.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border ${
                          isActive
                            ? "bg-[#A8C7F0] text-[#382A3A] border-[#A8C7F0] shadow-xs"
                            : "bg-white/80 text-[#382A3A]/70 border-[#A8C7F0]/30 hover:border-[#A8C7F0] hover:text-[#382A3A]"
                        }`}
                      >
                        {cat === "ALL" ? "All" : cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sort By Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSortOpen(!sortOpen);
                  }}
                  className="flex items-center gap-2 bg-white/90 hover:bg-white border border-[#A8C7F0]/40 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#382A3A] shadow-xs transition cursor-pointer"
                >
                  <span className="text-[#382A3A]/60 font-medium">Sort:</span>
                  <span>{sortLabels[sortBy]}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      sortOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#A8C7F0]/30 rounded-2xl shadow-xl p-1.5 z-40 overflow-hidden text-xs text-[#382A3A]">
                    {[
                      { label: "Featured / Default", value: "default" },
                      { label: "Price: Low to High", value: "priceAsc" },
                      { label: "Price: High to Low", value: "priceDesc" },
                      { label: "Name: A to Z", value: "nameAsc" },
                      { label: "Name: Z to A", value: "nameDesc" },
                      { label: "Newest Arrivals", value: "newest" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortOpen(false);
                        }}
                        className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-xl transition ${
                          sortBy === opt.value
                            ? "bg-[#A8C7F0]/30 font-bold text-[#382A3A]"
                            : "hover:bg-[#FFFAF3] text-[#382A3A]/80"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-[#382A3A]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Item count sub-bar */}
          <div className="flex items-center justify-between pt-3 text-xs text-[#382A3A]/70 uppercase tracking-wider font-semibold">
            <span>Showing {boysProducts.length} items</span>
            {selectedCategory !== "ALL" && (
              <span className="text-[11px] bg-[#D8C9FF]/30 px-2.5 py-0.5 rounded-full text-[#382A3A]">
                Filtered by: {selectedCategory}
              </span>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <section className="px-6 md:px-12 py-6 max-w-7xl mx-auto">
          {loading && (
            <div className="py-16 flex justify-center items-center">
              <TruckLoader />
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-center mb-8">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {boysProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Load More */}
          {page < pages && (
            <div className="flex justify-center mt-12 mb-12">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading}
                className="bg-[#A8C7F0] text-[#382A3A] px-9 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#8FB8EC] shadow-xs transition-all cursor-pointer"
              >
                {loading ? "Loading Styles..." : "Load More Styles"}
              </button>
            </div>
          )}
        </section>
      </main>

      <FooterSection />
    </div>
  );
};

const BoysPage = () => (
  <Suspense fallback={null}>
    <BoysContent />
  </Suspense>
);

export default BoysPage;
