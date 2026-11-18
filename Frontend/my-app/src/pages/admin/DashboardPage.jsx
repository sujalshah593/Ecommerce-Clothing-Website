import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios.js";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Ellipsis, Plus, ShoppingBag, Users, Wallet } from "lucide-react";
import TruckLoader from "../../components/TruckLoader.jsx";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/dashboard").then((res) => setStats(res.data)); }, []);
  const chart = useMemo(() => {
    const points = stats?.revenueTrendData || [];
    if (!points.length) return { line: "", area: "", labels: [] };
    const max = Math.max(...points.map((point) => Number(point.revenue) || 0), 1);
    const coords = points.map((point, index) => [20 + (index / Math.max(points.length - 1, 1)) * 760, 196 - ((Number(point.revenue) || 0) / max) * 140]);
    const line = coords.map(([x, y], index) => `${index ? "L" : "M"} ${x} ${y}`).join(" ");
    return { line, area: `${line} L 780 220 L 20 220 Z`, labels: points.map((point) => point.month) };
  }, [stats]);
  if (!stats) return <TruckLoader />;
  const cards = [
    { label: "Total revenue", value: formatCurrency(stats.totalRevenue), note: "Across all completed orders", change: "+12.5%", icon: <Wallet size={18} strokeWidth={1.7} />, tone: "blue" },
    { label: "New orders", value: Number(stats.totalOrders || 0).toLocaleString("en-IN"), note: "Orders placed this period", change: "+8.2%", icon: <ShoppingBag size={18} strokeWidth={1.7} />, tone: "paper" },
    { label: "Active customers", value: Number(stats.activeUsers || 0).toLocaleString("en-IN"), note: "Customers with recent activity", change: "+4.8%", icon: <Users size={18} strokeWidth={1.7} />, tone: "lavender" },
    { label: "Average order", value: formatCurrency(stats.avgOrderValue), note: "Average basket value", change: "+3.1%", icon: <ArrowUpRight size={18} strokeWidth={1.7} />, tone: "paper" },
  ];
  return <div className="admin-dashboard">
    <section className="dashboard-heading"><div><p className="eyebrow">Overview / November 2026</p><h1>Good morning, here&apos;s the pulse of your store</h1><p className="dashboard-subtitle">A clear view of sales, customers, and the products moving through Shreeji.</p></div><Link to="/admin/add-product" className="dashboard-primary-action"><Plus size={17} /> Add product</Link></section>
    <section className="stat-grid" aria-label="Store metrics">{cards.map(({ label, value, note, change, icon, tone }) => <article className={`stat-card stat-card-${tone}`} key={label}><div className="stat-card-top"><span>{label}</span>{icon}</div><strong>{value}</strong><div className="stat-card-foot"><span>{note}</span><b><ArrowUpRight size={13} /> {change}</b></div></article>)}</section>
    <section className="dashboard-main-grid">
      <article className="panel revenue-panel"><div className="panel-heading"><div><p className="eyebrow">Revenue trend</p><h2>Sales performance</h2></div><button className="period-control">Last 6 months <ChevronDown size={15} /></button></div><div className="revenue-summary"><strong>{formatCurrency(stats.totalRevenue)}</strong><span><ArrowUpRight size={14} /> 12.5% vs last period</span></div><div className="chart-wrap"><svg className="revenue-chart" viewBox="0 0 800 240" role="img" aria-label="Revenue trend"><defs><linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#A8C7F0" stopOpacity=".34" /><stop offset="100%" stopColor="#A8C7F0" stopOpacity="0" /></linearGradient></defs>{[40, 85, 130, 175, 220].map((y) => <line key={y} x1="20" x2="780" y1={y} y2={y} className="chart-grid-line" />)}<path d={chart.area} fill="url(#revenueFill)" /><path d={chart.line} className="revenue-line" />{chart.line && <circle cx="780" cy={chart.line.split(" ").slice(-1)[0]} r="4" className="chart-dot" />}</svg><div className="chart-labels">{chart.labels.map((label) => <span key={label}>{label}</span>)}</div></div></article>
      <article className="panel category-panel"><div className="panel-heading"><div><p className="eyebrow">Inventory mix</p><h2>Top categories</h2></div><button className="icon-button" aria-label="More category options"><Ellipsis size={18} /></button></div><div className="category-list">{(stats.salesByTargetGroup || []).map((item, index) => { const total = (stats.salesByTargetGroup || []).reduce((sum, entry) => sum + Number(entry.value || 0), 0) || 1; const percent = Math.round((Number(item.value || 0) / total) * 100); return <div className="category-row" key={item.name}><div><span className={`category-dot dot-${index}`} />{item.name}<b>{percent}%</b></div><div className="category-track"><span style={{ width: `${percent}%` }} /></div></div>; })}</div><div className="category-total"><span>Products in catalog</span><strong>{Number(stats.totalProducts || 0).toLocaleString("en-IN")}</strong></div></article>
    </section>
    <section className="panel products-panel"><div className="panel-heading"><div><p className="eyebrow">Merchandising</p><h2>Top selling products</h2></div><Link to="/admin/products" className="text-link">View all products <ArrowUpRight size={15} /></Link></div><div className="product-table"><div className="table-row table-head"><span>Product</span><span>Units sold</span><span>Revenue</span><span>Status</span><span /></div>{(stats.topProductsAgg || []).slice(0, 5).map((product, index) => <div className="table-row" key={`${product.name}-${index}`}><div className="product-name"><div className="product-thumb"><img src={product.image} alt="" /></div><span>{product.name}</span></div><span>{Number(product.totalQty || 0).toLocaleString("en-IN")}</span><strong>{formatCurrency(product.revenue)}</strong><span className="status"><i /> In stock</span><button className="row-menu" aria-label={`More options for ${product.name}`}><Ellipsis size={17} /></button></div>)}</div></section>
  </div>;
};
export default DashboardPage;
