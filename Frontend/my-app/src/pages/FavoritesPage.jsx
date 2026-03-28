import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleFavorite } from "../Redux/Slices/favoriteSlice";
import { addToCart } from "../Redux/Slices/cartSlice";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const FavoritesPage = () => {
  const dispatch = useDispatch();

  const { favorites } = useSelector((state) => state.favorite);

  const removeFavorite = (product) => {
    dispatch(toggleFavorite(product)); 
  };

  const addAllToCart = () => {
    favorites.forEach((product) => {
      dispatch(
        addToCart({
          ...product,
          qty: 1,
        })
      );
    });

    toast.success("Added Successfully")
  };

  const totalPrice = favorites.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
    
    <Navbar />
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-6 mt-20">
          <h1 className="font-serif text1 text-4xl md:text-4xl font-light tracking-tight">
            Your Favorites
          </h1>
          <p className="text-muted-foreground text ml-5 mt-4 text-lg">
            {favorites.length}{" "}
            {favorites.length === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        // Empty State
        <div className="max-w-7xl font-serif mx-auto px-6 py-24 text-center">
          <Heart className="w-16 h-16 mx-auto mb-6 text-border" strokeWidth={1} />
          <h2 className="font-serif text-2xl mb-3 text">No Favorites Yet</h2>
          <p className="text-muted-foreground mb-8 text">
            Start adding items to your favorites to save them for later.
          </p>

          <Link to="/mens">
            <button className="bg-accent text1 bg-black text-white hover:cursor-pointer hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-md">
              Continue Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Product Grid */}
            {favorites.map((item) => (
              <div key={item._id} className="group">
                <div className="relative overflow-hidden bg-muted aspect-[3/4] mb-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-between p-4">
                    <Link to={`/product/${item._id}`}>
                      <button className="bg-foreground text text-background hover:bg-gray-300 hover:text-white hover:cursor-pointer px-4 py-2 text-sm flex items-center gap-2 rounded-md">
                        <ShoppingBag className="w-4 h-4" />
                        View
                      </button>
                    </Link>

                    <button
                      onClick={() => removeFavorite(item)}
                      className="bg-background/80 hover:bg-red-500 hover:text-white hover:cursor-pointer p-2 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <p className="text-xs text text-muted-foreground uppercase tracking-wider">
                    {item.category}
                  </p>
                  <h3 className="font-serif text1 text-lg leading-tight">
                    {item.name}
                  </h3>
                  <p className="font-semibold text text-accent">
                    ₹{item.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <p className="text-sm text-muted-foreground mb-2 text1">Total Value</p>
              <p className="font-serif text-3xl font-light text">
                ₹{totalPrice.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-4 mt-8 md:mt-0">
              <Link to="/cart">
                <button className="border text1 px-6 py-3 rounded-md hover:bg-black font-serif hover:text-white hover:cursor-pointer">
                  Continue Shopping
                </button>
              </Link>

              <button
                onClick={addAllToCart}
                className="bg-accent font-serif text1 border hover:cursor-pointer hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-md"
              >
                Add All to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
    </>
  );
};

export default FavoritesPage;
