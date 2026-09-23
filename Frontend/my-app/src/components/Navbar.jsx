import { ShoppingCart, Search, ChevronDown, LayoutGrid, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSelector } from "react-redux";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useSelector((state) => state.cart);
  const cartCount = cartItems?.reduce((total, item) => total + item.qty, 0) || 0;
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white px-4 md:px-12 py-4 flex flex-col font-sans">
      {/* Top Section */}
      <div className="flex items-center justify-between w-full pb-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Link to="/" className="text-xl text1 md:text-2xl font-bold uppercase tracking-widest">
            <span className="text-[#111111]">SHRÉEJI</span>
            <span className="text-[#B76E4D]">.</span>
          </Link>
        </div>

        {/* Search Bar - Center */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div className="flex items-center w-full bg-white rounded-full px-6 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
            <input 
              type="text" 
              placeholder="Search..." 
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 font-medium"
            />
            <Search className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Right Section (Cart & Profile) */}
        <div className="flex items-center gap-6">
          <Menu className="md:hidden w-6 h-6 cursor-pointer" onClick={() => setMobileOpen(true)} />
          
          <Link to="/cart" className="relative hidden md:flex items-center cursor-pointer hover:opacity-80 transition">
            <ShoppingCart className="w-5 h-5 text-black" strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-3 relative">
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
              onClick={() => setOpen(!open)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                <img 
                  src="https://api.dicebear.com/7.x/notionists/svg?seed=Robin&backgroundColor=e2e8f0" 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="text-sm font-medium text-black">
                {user ? user.name?.split(' ')[0] : 'Robin'}
              </span>
              <ChevronDown className="w-4 h-4 text-black" />
            </div>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                {user?.isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-semibold text-blue-600">Admin Dashboard</Link>
                )}
                <Link to="/profile" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                {user ? (
                  <button onClick={() => { logout(); setOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Logout</button>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Sign In</Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Navigation (Styled as Tags) */}
      <div className="hidden md:flex flex-wrap items-center justify-center gap-10 w-full pt-4 pb-2 text-[11px] font-bold tracking-[0.05em] text-blue-900 uppercase">
        <Link to="/categories" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all">
          <LayoutGrid className="w-3.5 h-3.5" />
          ALL CATEGORIES
        </Link>
        <Link to="/new" className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all">NEW PRODUCT</Link>
        <Link to="/Mens" className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all">MEN</Link>
        <Link to="/Boys" className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all">BOYS</Link>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[80%] bg-[#F6F7ED] flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="font-bold text-xl">Linea Fashion</span>
              <X onClick={() => setMobileOpen(false)} className="cursor-pointer" />
            </div>
            
            <div className="p-4">
              <div className="flex items-center w-full bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 mb-6">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                />
                <Search className="w-4 h-4 text-gray-500" />
              </div>

              <div className="flex flex-col gap-5 uppercase font-semibold text-sm">
                <Link to="/categories" onClick={() => setMobileOpen(false)}>All Categories</Link>
                <Link to="/new" onClick={() => setMobileOpen(false)}>New Product</Link>
                <Link to="/Mens" onClick={() => setMobileOpen(false)}>Men</Link>
                <Link to="/Boys" onClick={() => setMobileOpen(false)}>Boys</Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)}>Cart ({cartCount})</Link>
                {user?.isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-blue-600">Admin Dashboard</Link>
                )}
                {user ? (
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left">Logout</button>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
