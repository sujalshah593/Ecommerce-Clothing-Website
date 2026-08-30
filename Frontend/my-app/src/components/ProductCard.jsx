import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import { toggleFavorite } from "../Redux/Slices/favoriteSlice.js";

const ProductCard = ({ product }) => {

  const dispatch = useDispatch();
  const { favorites } = useSelector((state) => state.favorite);



  const isFavorite = favorites.some((p) => p._id === product._id); 
  return (
     <Link to={`/product/${product._id}`} className="block">
    <div className="group space-y-4 cursor-pointer bg-[#FFFFFF] border border-[#ECECEC] rounded-xl shadow-sm p-3">
      <div className="relative aspect-[3/4] bg-[#FAFAF8] rounded-lg overflow-hidden">
        <img
          src={product.image || "/placeholder.jpg"}
          alt={product.name}
          className="w-full h-full object-cover 
            group-hover:scale-105 
            group-hover:brightness-90 
            transition-all duration-300 ease-out"
        />

        <button
          onClick={() => dispatch(toggleFavorite(product))}
          className="absolute top-4 right-4 p-2.5 
            bg-[#FAFAF8]/40 backdrop-blur-md rounded-full 
            opacity-0 -translate-y-2 
            group-hover:opacity-100 group-hover:translate-y-0 
            transition-all duration-300 hover:bg-[#FAFAF8]/80"
          aria-label="Add to wishlist"
        >
          <Heart className={`w-5 hover:cursor-pointer hover:text-pink-500 hover:fill-pink-500 h-5 transition ${isFavorite ? "fill-pink-500 text-pink-500 " : "text-[#6B7280]"}`} />
        </button>

        <button
          className="absolute bottom-0 left-0 right-0 py-5 bg-[#111111] text-[#FFFFFF] text-[10px] font-bold uppercase tracking-[0.3em] translate-y-full group-hover:translate-y-0 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 font-serif hover:bg-[#B76E4D] transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <p className="text">Quick Buy</p>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline gap-4 font-serif">
          <h4 className="text-[11px] text1 uppercase tracking-[0.2em] leading-tight flex-1 text-[#111111]">
            {product.name}
          </h4>
          <p className="text-[12px] font-medium tracking-tighter">
            ₹{product.price}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-[10px] text-[#6B7280] uppercase tracking-[0.2em] font-medium border-r pr-3">
            {product.category}
          </p>
        </div>
      </div>
    </div>
    </Link>
  );
};

export default ProductCard;
