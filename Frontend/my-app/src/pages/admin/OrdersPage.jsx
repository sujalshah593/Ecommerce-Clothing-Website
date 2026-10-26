import { useEffect, useState } from "react";
import { Search, Filter, ChevronRight, Package } from "lucide-react";
import api from "../../api/axios.js";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    api.get("/orders").then((res) => setOrders(res.data));
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/admin/orders/${id}`, { status });
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All" || o.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 font-serif">
      <h1 className="text-4xl font-serif font-bold text-[#111111] text1">Orders</h1>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]" />
          <input
            className="w-full pl-12 pr-4 py-3 text  bg-[#FFFAF3] border border-[#111111] rounded-lg text-[#111111]"
            placeholder="Search order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#FFFAF3] border text1 border-[#111111] rounded-lg px-4 text-[#111111]"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((o) => (
          <div
            key={o._id}
            className="bg-[#FFFAF3] p-6 rounded-lg border border-[#111111]"
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="bg-purple-900/20 p-3 rounded-lg">
                  <Package className="text-purple-400" />
                </div>
                <div>
                  <p className=" text-lg text1 font-bold">
                    {o.orderItems.map((i) => i.name).join(", ")}
                  </p>

                  {/* Customer name */}
                  <p className="text-[#6B7280] text">
                    {o.user?.name || "Guest User"}
                  </p>
                  {/*P name*/}
                  <p className="font text">{o._id}</p>

                  <p className="text-slate-500 text-xs text">Status: {o.status}</p>
                </div>
              </div>

              <button
                onClick={() => updateStatus(o._id, "Shipped")}
                className="bg-[#A8C7F0] text-[#382A3A] px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#A8C7F0] transition-colors !py-2 !px-4"
              >
                Mark Shipped
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
