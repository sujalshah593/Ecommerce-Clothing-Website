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
    <section className="bg-[#FFFFFF]">
      <div className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-6xl header uppercase">New Arrivals</h2>

        <p className="text-sm uppercase text tracking-widest text-[#111111]">
          — Choose Wisely
        </p>
      </div>

      {error && <p className="text-[#B76E4D]">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {products.length === 0 && !loading && (
          <p className="col-span-full text text-center text-[#6B7280]">
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
            className="bg-blue-600 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
      </div>
    </section>
  );
};

export default ProductSection;
