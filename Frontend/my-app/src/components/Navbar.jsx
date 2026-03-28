import { ShoppingCart, Search, Menu, Heart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSelector } from "react-redux";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { products } = useSelector((state) => state.products);

  return (
    <nav className="fixed top-0 w-full z-50 grid grid-cols-3 items-center px-4 py-3 md:px-12 bg-white">
      {/* Left Section */}
      <div className="flex items-center">
        {/* Mobile menu icon */}
        <Menu
          className="lg:hidden w-6 h-6 cursor-pointer"
          onClick={() => setMobileOpen(true)}
        />

        {/* Desktop menu */}
        <div className="hidden lg:flex gap-8 uppercase text font-bold tracking-widest text-gray-500 text-[13px] ml-4">
          <Link to="/Boys" className="hover:text-black">
            Boys
          </Link>
          <Link to="/Mens" className="hover:text-black">
            Men
          </Link>
          <Link to="/about-us" className="hover:text-black">
            About Us
          </Link>
          <Link to="/privacy-policy" className="hover:text-black">
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* Center Logo */}
      <div className="flex justify-center">
        <Link
          to="/"
          className="text-xl text1 md:text-2xl font-bold uppercase tracking-widest"
        >
          SHRÉEJI<span className="text-red-500">.</span>
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex  items-center justify-end gap-4 md:gap-6">
        {/* Search */}
        <Search
          className="w-5 h-5 hover:scale-105 cursor-pointer"
          onClick={() => setSearchOpen(true)}
        />

        {/* Favorites */}
        <Link
          to="/favorite"
          className="w-9 h-9 flex items-center justify-center hover:scale-105 bg-black rounded-full"
        >
          <Heart className="w-5 h-5 text-gray-400" />
        </Link>

        {/* Cart */}
        <div className="relative">
          <Link
            to="/cart"
            className="w-9 h-9 flex items-center hover:scale-105  justify-center bg-black rounded-full  transition"
          >
            <ShoppingCart className="w-5 h-5 text-gray-400 text" />
          </Link>

          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full px-1 font-bold">
              {cartCount}
            </span>
          )}
        </div>

        {/* Profile / Sign In */}
        {user ? (
          <div className="relative hidden sm:block">
            <button
              onClick={() => setOpen((p) => !p)}
              className="w-9 h-9 rounded-full text1 hover:scale-105 hover:cursor-pointer bg-black text-white flex items-center justify-center uppercase text-xs font-bold"
            >
              {user.name?.charAt(0)}
            </button>

            {open && (
              <div className="absolute right-0 text1 mt-2 w-40 bg-white shadow-lg z-50">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-xs hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-xs hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="hidden sm:block text1 px-6 py-2 bg-black text-white text-[10px] uppercase tracking-widest"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <span className="text-lg text1 font-bold uppercase mr-5">
                SHRÉEJI<span className="text-red-500">.</span>
              </span>
              <button onClick={() => setMobileOpen(false)}>
                <X />
              </button>
            </div>

            <div className="flex flex-col px-6 py-8 text space-y-6 text-sm font-bold uppercase tracking-widest">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                Home
              </Link>
              <Link to="/Mens" onClick={() => setMobileOpen(false)}>
                Men
              </Link>
              <Link to="/Boys" onClick={() => setMobileOpen(false)}>
                Boys
              </Link>
              <Link to="/about-us" onClick={() => setMobileOpen(false)}>
                About Us
              </Link>
              <Link to="/privacy-policy" onClick={() => setMobileOpen(false)}>
                Privacy Policy
              </Link>
              <Link to="/cart" onClick={() => setMobileOpen(false)}>
                Cart ({cartCount})
              </Link>

              <div className="border-t pt-6 space-y-4">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="bg-black text1 text-white px-7 py-3 block"
                      onClick={() => setMobileOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="bg-black text1 text-white px-7 py-3 w-full text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Drawer */}
      {searchOpen && (
        <div className="fixed inset-0 z-[999]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSearchOpen(false)}
          />
          <div className="absolute right-0 text top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <span className="flex gap-3 font-bold uppercase">
                <Search /> Search
              </span>
              <button onClick={() => setSearchOpen(false)}>
                <X />
              </button>
            </div>

            <div className="p-6">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-3 border rounded-md"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
              {searchQuery &&
                products
                  .filter((p) =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .slice(0, 10)
                  .map((p) => (
                    <Link
                      key={p._id}
                      to={`/product/${p._id}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex gap-4 items-center border-b pb-4"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-14 h-20 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-gray-500">₹{p.price}</p>
                      </div>
                    </Link>
                  ))}

              {searchQuery &&
                products.filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()),
                ).length === 0 && (
                  <p className="text-sm text text-gray-500">
                    No products found
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
