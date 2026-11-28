import { LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const MIN_SEARCH_LENGTH = 2;
const MAX_SUGGESTIONS = 6;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HighlightedName = ({ name, query }) => {
  const search = query.trim();
  if (!search) return name;
  return name.split(new RegExp(`(${escapeRegExp(search)})`, "ig")).map((part, index) => (
    part.toLowerCase() === search.toLowerCase()
      ? <mark key={index} className="rounded-sm bg-[#A8C7F0]/50 px-0.5 text-inherit">{part}</mark>
      : part
  ));
};

const ProductSearchAutocomplete = ({ compact = false, onNavigate }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const closeDropdown = () => {
    abortControllerRef.current?.abort();
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const goTo = (path) => {
    closeDropdown();
    onNavigate?.();
    navigate(path);
  };

  const viewAllResults = () => {
    const search = query.trim();
    if (search.length >= MIN_SEARCH_LENGTH) goTo(`/search?query=${encodeURIComponent(search)}`);
  };

  const handleQueryChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    if (nextQuery.trim().length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      setStatus("idle");
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    setStatus("loading");
    setIsOpen(true);
    setActiveIndex(-1);
  };

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) closeDropdown();
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    const search = query.trim();
    abortControllerRef.current?.abort();
    const requestSequence = ++requestSequenceRef.current;
    if (search.length < MIN_SEARCH_LENGTH) {
      return undefined;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const debounceTimer = window.setTimeout(async () => {
      try {
        const { data } = await api.get("/products", {
          params: { search, page: 1, limit: MAX_SUGGESTIONS },
          signal: controller.signal,
        });
        if (requestSequence !== requestSequenceRef.current) return;
        const products = data.products || [];
        setSuggestions(products);
        setStatus(products.length ? "ready" : "empty");
      } catch (error) {
        if (error.code === "ERR_CANCELED" || requestSequence !== requestSequenceRef.current) return;
        setSuggestions([]);
        setStatus("error");
      }
    }, 300);

    return () => {
      window.clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query]);

  const handleKeyDown = (event) => {
    const optionCount = suggestions.length + 1;
    if (event.key === "Escape") return closeDropdown();
    if (event.key === "ArrowDown" && isOpen) {
      event.preventDefault();
      return setActiveIndex((current) => Math.min(current + 1, optionCount - 1));
    }
    if (event.key === "ArrowUp" && isOpen) {
      event.preventDefault();
      return setActiveIndex((current) => Math.max(current - 1, -1));
    }
    if (event.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        event.preventDefault();
        return goTo(`/product/${suggestions[activeIndex]._id}`);
      }
      if (activeIndex === suggestions.length || query.trim().length >= MIN_SEARCH_LENGTH) {
        event.preventDefault();
        viewAllResults();
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={`flex w-full items-center rounded-full border border-[#A8C7F0]/40 bg-[#FFFAF3] px-4 transition-all hover:bg-white focus-within:bg-white ${compact ? "py-2.5 text-xs" : "py-2 text-sm"}`}>
        <Search className="mr-2 h-4 w-4 shrink-0 text-[#382A3A]/40" aria-hidden="true" />
        <input type="search" value={query} onChange={handleQueryChange} onFocus={() => query.trim().length >= MIN_SEARCH_LENGTH && setIsOpen(true)} onKeyDown={handleKeyDown} placeholder="Search products..." aria-label="Search products" aria-autocomplete="list" aria-controls={isOpen ? listboxId : undefined} aria-expanded={isOpen} className="min-w-0 flex-1 bg-transparent font-medium text-[#382A3A] outline-none placeholder:text-[#382A3A]/40" />
        {status === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin text-[#382A3A]/50" aria-label="Searching" /> : query && <button type="button" onClick={() => { setQuery(""); setSuggestions([]); setStatus("idle"); setIsOpen(false); setActiveIndex(-1); }} className="p-0.5 text-[#382A3A]/50 hover:text-[#382A3A]" aria-label="Clear search"><X className="h-4 w-4" /></button>}
      </div>

      {isOpen && <div id={listboxId} role="listbox" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[100] overflow-hidden rounded-2xl border border-[#A8C7F0]/40 bg-[#FFFAF3] shadow-xl">
        {status === "loading" && <p className="px-4 py-4 text-sm text-[#382A3A]/60">Searching products…</p>}
        {status === "error" && <p className="px-4 py-4 text-sm text-red-600">Couldn’t search products. Please try again.</p>}
        {status === "empty" && <p className="px-4 py-4 text-sm text-[#382A3A]/60">No products found for “{query.trim()}”.</p>}
        {status === "ready" && suggestions.map((product, index) => <button key={product._id} type="button" role="option" aria-selected={activeIndex === index} onMouseDown={(event) => event.preventDefault()} onClick={() => goTo(`/product/${product._id}`)} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${activeIndex === index ? "bg-[#A8C7F0]/35" : "hover:bg-white"}`}><img src={product.image} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-white object-cover" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#382A3A]"><HighlightedName name={product.name} query={query} /></span><span className="mt-0.5 block text-xs text-[#382A3A]/65">₹{Number(product.price).toLocaleString("en-IN")}</span></span></button>)}
        {status !== "loading" && <button type="button" role="option" aria-selected={activeIndex === suggestions.length} onMouseDown={(event) => event.preventDefault()} onClick={viewAllResults} className={`flex w-full items-center gap-2 border-t border-[#A8C7F0]/30 px-4 py-3 text-left text-sm font-semibold text-[#382A3A] transition ${activeIndex === suggestions.length ? "bg-[#A8C7F0]/35" : "hover:bg-white"}`}><Search className="h-4 w-4" />View all results for “{query.trim()}”</button>}
      </div>}
    </div>
  );
};

export default ProductSearchAutocomplete;
