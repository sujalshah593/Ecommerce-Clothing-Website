import { NavLink, Outlet, Link } from "react-router-dom";
import { BarChart3, ClipboardList, LayoutDashboard, LogOut, Menu, Moon, Package, ShoppingCart, Sun, Users, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("shreeji-admin-theme") || "dark");
  const { logout } = useAuth();
  const navItems = [
    { to: "/admin", label: "Overview", icon: <LayoutDashboard size={17} />, end: true },
    { to: "/admin/users", label: "Customers", icon: <Users size={17} /> },
    { to: "/admin/products", label: "Products", icon: <Package size={17} /> },
    { to: "/admin/inventory", label: "Inventory", icon: <ClipboardList size={17} /> },
    { to: "/admin/orders", label: "Orders", icon: <ShoppingCart size={17} /> },
  ];
  const toggleTheme = () => setTheme((current) => { const next = current === "dark" ? "light" : "dark"; localStorage.setItem("shreeji-admin-theme", next); return next; });
  return <div className="admin-shell" data-theme={theme}><aside className={`admin-sidebar ${sidebarOpen ? "is-open" : "is-collapsed"}`}><div className="admin-brand"><Link to="/" className="brand-mark">S</Link>{sidebarOpen && <div><strong>SHRÉEJI</strong><span>Admin workspace</span></div>}</div><div className="sidebar-section-label">Workspace</div><nav className="admin-nav">{navItems.map(({ to, label, icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>{icon}{sidebarOpen && <span>{label}</span>}</NavLink>)}</nav><div className="sidebar-bottom"><button className="sidebar-toggle" onClick={() => setSidebarOpen((open) => !open)}>{sidebarOpen ? <X size={17} /> : <Menu size={17} />}{sidebarOpen && <span>Collapse menu</span>}</button><button className="admin-logout" onClick={logout}><LogOut size={17} />{sidebarOpen && <span>Log out</span>}</button></div></aside><div className="admin-content"><header className="admin-topbar"><div className="topbar-title"><BarChart3 size={17} /><span>Store analytics</span></div><div className="topbar-actions"><span className="live-indicator"><i /> Live data</span><button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === "dark" ? "Light" : "Dark"}</span></button><Link to="/" className="store-link">View storefront <ArrowUpRightIcon /></Link></div></header><main className="admin-main"><Outlet /></main></div></div>;
};
const ArrowUpRightIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M7 7h10v10" /></svg>;
export default AdminLayout;
