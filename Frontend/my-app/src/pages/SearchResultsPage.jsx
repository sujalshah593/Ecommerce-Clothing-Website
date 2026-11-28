import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import FooterSection from "../components/FooterSection.jsx";
import ProductCard from "../components/ProductCard.jsx";
import TruckLoader from "../components/TruckLoader.jsx";
import api from "../api/axios.js";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("query") || "").trim();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [settledQuery, setSettledQuery] = useState("");
  const requestRef = useRef(0);
  const isSearchable = query.length >= 2;
  const displayStatus = !isSearchable ? "idle" : settledQuery === query ? status : "loading";
  const displayProducts = isSearchable ? products : [];

  useEffect(() => {
    if (query.length < 2) return undefined;
    const controller = new AbortController();
    const requestId = ++requestRef.current;
    api.get("/products", { params: { search: query, page: 1, limit: 50 }, signal: controller.signal })
      .then(({ data }) => {
        if (requestId !== requestRef.current) return;
        setProducts(data.products || []);
        setStatus("ready");
        setSettledQuery(query);
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED" || requestId !== requestRef.current) return;
        setProducts([]);
        setStatus("error");
        setSettledQuery(query);
      });
    return () => controller.abort();
  }, [query]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFFAF3] px-6 pb-20 pt-32 md:px-12 md:pt-44">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-[#382A3A]/60">Search results</p>
          <h1 className="mt-2 text-3xl font-bold text-[#382A3A] md:text-4xl">{query ? `Results for “${query}”` : "Search products"}</h1>
          {displayStatus === "loading" && <div className="py-20"><TruckLoader /></div>}
          {displayStatus === "error" && <p className="py-12 text-red-600">Couldn’t load search results. Please try again.</p>}
          {displayStatus === "idle" && <p className="py-12 text-[#382A3A]/60">Enter at least two characters in the search bar.</p>}
          {displayStatus === "ready" && (displayProducts.length ? <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{displayProducts.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <div className="py-12 text-[#382A3A]/60">No products matched your search. <Link to="/" className="font-semibold text-[#382A3A] underline">Browse all products</Link>.</div>)}
        </div>
      </main>
      <FooterSection />
    </>
  );
};

export default SearchResultsPage;
