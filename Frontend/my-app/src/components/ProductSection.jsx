import ProductCard from "./ProductCard";

const ProductSection = ({
  products = [],
  loading,
  error,
  pages = 0,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <section className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-6xl text1">New Arrivals</h2>

        <p className="text-sm uppercase text tracking-widest text-black">
          — Choose Wisely
        </p>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {products.length === 0 && !loading && (
          <p className="col-span-full text text-center text-gray-500">
            No products found
          </p>
        )}

        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {currentPage < pages && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={loading}
            className="px-10 text1 py-3 border border-black text-xs font-bold uppercase tracking-widest
                       hover:bg-black hover:text-white transition"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductSection;
