import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: BarChart3 },
    { to: "/admin/users", label: "Users", icon: BarChart3 },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  ];

  return (
    <div className="flex h-screen bg-white">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-black transition-all duration-300 flex flex-col`}
      >
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-xl text1 font-bold text-white">
            {sidebarOpen ? "SHRÉEJI" : "S"}
          </span>
          </Link>
        </div>
        <nav className="flex-1 text1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-white text-black"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t text1 border-slate-800 p-4">
          <button className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-red-900/20 transition text-slate-300 hover:text-red-400">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-300 flex items-center justify-between px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-300 rounded-lg transition"
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <span className="text-sm text-slate-400 text">Admin Dashboard</span>
        </header>
        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-8">

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
