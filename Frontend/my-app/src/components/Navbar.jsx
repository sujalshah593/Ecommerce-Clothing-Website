import { ShoppingCart, Search, ChevronDown, LayoutGrid, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSelector } from "react-redux";
import { useState } from "react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useSelector((state) => state.cart);
  const cartCount = cartItems?.reduce((total, item) => total + item.qty, 0) || 0;
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FFFAF3]/95 backdrop-blur-md border-b border-[#A8C7F0]/30 px-6 md:px-10 py-3 md:py-4 flex items-center justify-between font-sans transition-all">
      
      {/* Left: Logo */}
      <div className="flex items-center shrink-0">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="SHREEJI Logo" className="h-12 md:h-14 lg:h-16 w-auto object-contain hover:opacity-90 transition" />
        </Link>
      </div>

      {/* Center: All nav links + search bar in one row */}
      <div className="hidden lg:flex items-center justify-between flex-1 mx-8 gap-4">
        {/* Nav Links */}
        <div className="flex items-center gap-7 text-[11px] font-bold tracking-[0.05em] uppercase text-[#382A3A] whitespace-nowrap">
          <Link to="/new" className="px-3.5 py-2 rounded-full  border-[#A8C7F0]/40 bg-[#FFFAF3] hover:bg-[#A8C7F0] hover:text-[#382A3A] hover:border-[#A8C7F0] transition-all">
            New Product
          </Link>
          <Link to="/Mens" className="px-3.5 py-2 rounded-full  border-[#A8C7F0]/40 bg-[#FFFAF3] hover:bg-[#A8C7F0] hover:text-[#382A3A] hover:border-[#A8C7F0] transition-all">
            Men
          </Link>
          <Link to="/Boys" className="px-3.5 py-2 rounded-full  border-[#A8C7F0]/40 bg-[#FFFAF3] hover:bg-[#A8C7F0] hover:text-[#382A3A] hover:border-[#A8C7F0] transition-all">
            Boys
          </Link>
          <Link to="/privacy-policy" className="px-3.5 py-2 rounded-full  border-[#A8C7F0]/40 bg-[#FFFAF3] hover:bg-[#A8C7F0] hover:text-[#382A3A] hover:border-[#A8C7F0] transition-all">
            Privacy Policy
          </Link>
          <Link to="/about-us" className="px-3.5 py-2 rounded-full  border-[#A8C7F0]/40 bg-[#FFFAF3] hover:bg-[#A8C7F0] hover:text-[#382A3A] hover:border-[#A8C7F0] transition-all">
            Contact Us
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex items-center min-w-[400px] max-w-xs bg-[#FFFAF3] hover:bg-[#FFFAF3] focus-within:bg-[#FFFAF3] rounded-full px-4 py-2 border border-[#A8C7F0]/40 transition-all">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="flex-1 bg-transparent outline-none text-sm text-[#382A3A] placeholder-[#382A3A]/40 font-medium"
          />
          <Search className="w-4 h-4 text-[#382A3A]/40 shrink-0 ml-1" />
        </div>
      </div>

      {/* Tablet fallback: search bar in center */}
      <div className="hidden md:flex lg:hidden flex-1 max-w-xs mx-4">
        <div className="flex items-center w-full bg-[#FFFAF3] rounded-full px-4 py-2.5 border border-[#A8C7F0]/40">
          <input 
            type="text" 
            placeholder="Search..." 
            className="flex-1 bg-transparent outline-none text-xs text-[#382A3A] placeholder-[#382A3A]/40"
          />
          <Search className="w-4 h-4 text-[#382A3A]/40" />
        </div>
      </div>

      {/* Right: Cart & Profile */}
      <div className="flex items-center gap-5 shrink-0">
        <Menu className="lg:hidden w-6 h-6 cursor-pointer text-[#382A3A]" onClick={() => setMobileOpen(true)} />
        
        <Link to="/cart" className="relative hidden md:flex items-center cursor-pointer hover:opacity-80 transition p-1">
          <ShoppingCart className="w-6 h-6 text-[#382A3A]" strokeWidth={2} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#382A3A] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-2.5 relative">
          <div className="h-6 w-px bg-[#A8C7F0]/50"></div>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            onClick={() => setOpen(!open)}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#A8C7F0]/50 border border-[#A8C7F0]/50">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Robin&backgroundColor=e2e8f0" 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="text-sm font-semibold text-[#382A3A]">
              {user ? user.name?.split(' ')[0] : 'Robin'}
            </span>
            <ChevronDown className="w-4 h-4 text-[#382A3A]/70" />
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#FFFAF3] border border-[#A8C7F0]/30 rounded-xl shadow-xl z-50 overflow-hidden py-1">
              {user?.isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-[#A8C7F0] hover:bg-[#FFFAF3] font-semibold">Admin Dashboard</Link>
              )}
              <Link to="/profile" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-[#382A3A] hover:bg-[#FFFAF3]">Profile</Link>
              <Link to="/privacy-policy" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-[#382A3A] hover:bg-[#FFFAF3]">Privacy Policy</Link>
              <Link to="/about-us" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-[#382A3A] hover:bg-[#FFFAF3]">Contact Us</Link>
              {user ? (
                <button onClick={() => { logout(); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-[#FFFAF3] border-t border-[#A8C7F0]/30 mt-1">Logout</button>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-[#382A3A] hover:bg-[#FFFAF3]">Sign In</Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[80%] bg-[#FFFAF3] flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#A8C7F0]/40">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center">
                <img src={logo} alt="SHREEJI Logo" className="h-12 w-auto object-contain" />
              </Link>
              <X onClick={() => setMobileOpen(false)} className="cursor-pointer" />
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="flex items-center w-full bg-[#FFFAF3] rounded-full px-4 py-2 shadow-sm border border-[#A8C7F0]/30 mb-6">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="flex-1 bg-transparent outline-none text-sm text-[#382A3A]"
                />
                <Search className="w-4 h-4 text-[#382A3A]/40" />
              </div>

              <div className="flex flex-col gap-4 uppercase font-semibold text-sm text-[#382A3A]">
                <Link to="/categories" onClick={() => setMobileOpen(false)} className="hover:text-[#A8C7F0] transition-colors">All Categories</Link>
                <Link to="/new" onClick={() => setMobileOpen(false)} className="hover:text-[#A8C7F0] transition-colors">New Product</Link>
                <Link to="/Mens" onClick={() => setMobileOpen(false)} className="hover:text-[#A8C7F0] transition-colors">Men</Link>
                <Link to="/Boys" onClick={() => setMobileOpen(false)} className="hover:text-[#A8C7F0] transition-colors">Boys</Link>
                <div className="border-t border-[#A8C7F0]/40 my-1" />
                <Link to="/privacy-policy" onClick={() => setMobileOpen(false)} className="hover:text-[#A8C7F0] transition-colors">Privacy Policy</Link>
                <Link to="/about-us" onClick={() => setMobileOpen(false)} className="hover:text-[#A8C7F0] transition-colors">Contact Us</Link>
                <div className="border-t border-[#A8C7F0]/40 my-1" />
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="hover:text-[#A8C7F0] transition-colors">Cart ({cartCount})</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="hover:text-[#A8C7F0] transition-colors">Profile</Link>
                {user?.isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-[#A8C7F0]">Admin Dashboard</Link>
                )}
                {user ? (
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left text-red-600">Logout</button>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="hover:text-[#A8C7F0] transition-colors">Sign In</Link>
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
