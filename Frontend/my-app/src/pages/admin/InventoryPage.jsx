import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { Search, MoreVertical, Package, AlertTriangle, XCircle, CheckCircle, Edit, X } from "lucide-react";
import { toast } from "react-toastify";

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustStockValue, setAdjustStockValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/admin/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProducts(data);
    } catch (err) {
      console.error("Products fetch error:", err);
      toast.error("Failed to fetch inventory");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStockStatus = (count) => {
    if (count === 0) return "Out of Stock";
    if (count > 0 && count <= 5) return "Low Stock";
    return "In Stock";
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getStockStatus(product.countInStock);
    const matchesStatus = statusFilter === "All" || statusFilter === status;

    return matchesSearch && matchesStatus;
  });

  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.countInStock > 5).length;
  const lowStockCount = products.filter(p => p.countInStock > 0 && p.countInStock <= 5).length;
  const outOfStockCount = products.filter(p => p.countInStock === 0).length;

  const handleAdjustStockSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(adjustStockValue, 10);
    
    if (isNaN(qty) || qty < 0) {
      toast.error("Quantity must be a valid positive integer");
      return;
    }

    setIsUpdating(true);
    try {
      const { data } = await api.patch(
        `/admin/products/${selectedProduct._id}/inventory`,
        { countInStock: qty },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      setProducts(products.map(p => p._id === data._id ? data : p));
      toast.success("Stock updated successfully");
      setIsAdjustModalOpen(false);
    } catch (err) {
      toast.error("Failed to update stock");
    } finally {
      setIsUpdating(false);
    }
  };

  const openAdjustModal = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setAdjustStockValue(product.countInStock.toString());
    setIsAdjustModalOpen(true);
  };

  const openDetailsModal = (product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] bg-[#FFFAF3] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-serif mb-3 text-[#111111] text1">Inventory</h1>
          <p className="text-[#6B7280] text">
            Monitor product stock and inventory levels
          </p>
        </div>

        <div className="grid grid-cols-1 text md:grid-cols-4 gap-6 mb-12">
          <div className="border rounded p-6 bg-[#FFFAF3] shadow-sm">
            <p className="text-[10px] font-bold text1 uppercase tracking-[0.2em] text-[#6B7280] mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" /> Total Products
            </p>
            <p className="text-4xl text1 font-serif text-[#111111]">{totalProducts}</p>
          </div>

          <div className="border rounded p-6 bg-[#FFFAF3] shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280] mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> In Stock
            </p>
            <p className="text-4xl text1 font-serif text-green-600">
              {inStockCount}
            </p>
          </div>

          <div className="border rounded p-6 bg-[#FFFAF3] shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280] mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" /> Low Stock
            </p>
            <p className="text-4xl font-serif text1 text-orange-500">
              {lowStockCount}
            </p>
          </div>

          <div className="border rounded p-6 bg-[#FFFAF3] shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280] mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" /> Out of Stock
            </p>
            <p className="text-4xl font-serif text1 text-red-600">
              {outOfStockCount}
            </p>
          </div>
        </div>

        <div className="border rounded p-6 mb-8 space-y-4 bg-[#FFFAF3] shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-[#382A3A]/40" />
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 text-[#111111] text py-3 border rounded focus:outline-none focus:ring-1 focus:ring-[#E35336]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["All", "In Stock", "Low Stock", "Out of Stock"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-6 text py-3 text-[10px] font-bold uppercase tracking-[0.1em] ${
                    statusFilter === status
                      ? "bg-[#111111] text-[#FFFFFF]"
                      : "border hover:bg-[#EAEAEA]/20 text-[#111111]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border rounded bg-[#FFFAF3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-[#D8C9FF]/20">
                <tr>
                  <th className="px-6 py-4 text1 text-[#111111] text-left text-[10px] font-bold uppercase tracking-[0.2em]">Product</th>
                  <th className="px-6 py-4 text-left text1 text-[#111111] text-[10px] font-bold uppercase tracking-[0.2em]">Category</th>
                  <th className="px-6 py-4 text-left text1 text-[#111111] text-[10px] font-bold uppercase tracking-[0.2em]">Price</th>
                  <th className="px-6 py-4 text-left text1 text-[#111111] text-[10px] font-bold uppercase tracking-[0.2em]">Current Stock</th>
                  <th className="px-6 py-4 text-left text1 text-[#111111] text-[10px] font-bold uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-left text1 text-[#111111] text-[10px] font-bold uppercase tracking-[0.2em]">Last Updated</th>
                  <th className="px-6 py-4 text-right text1 text-[#111111] text-[10px] font-bold uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.countInStock);
                  let statusClass = "bg-green-100 text-green-700";
                  if (status === "Low Stock") statusClass = "bg-orange-100 text-orange-700";
                  if (status === "Out of Stock") statusClass = "bg-red-100 text-red-700";

                  return (
                    <tr
                      key={product._id}
                      className="border-b hover:bg-[#FFFAF3] cursor-pointer transition"
                      onClick={() => openDetailsModal(product)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded border"
                          />
                          <span className="font-medium text-sm text-[#111111] line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-[#111111] font-medium">₹{product.price}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#111111]">{product.countInStock}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full whitespace-nowrap ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#6B7280]">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => openAdjustModal(product, e)}
                          className="flex items-center gap-1 ml-auto text-[10px] font-bold uppercase tracking-[0.1em] text-[#382A3A] hover:text-blue-800 bg-[#D8C9FF]/20 hover:bg-blue-100 px-3 py-1.5 rounded transition"
                        >
                          <Edit className="w-3 h-3" /> Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="px-6 py-12 text-center text-[#6B7280]">
              No products found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* DETAILS MODAL */}
      {isDetailsModalOpen && selectedProduct && (
        <div className="absolute inset-0 z-50 flex items-start justify-center p-4 pt-32" style={{ minHeight: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-[#FFFAF3] rounded-xl shadow-2xl overflow-hidden sticky top-32" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-[#111111] m-0">Stock Details</h2>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-[#382A3A]/40 hover:text-[#382A3A]/70">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-24 h-24 object-cover rounded-lg border" />
                <div>
                  <h3 className="font-bold text-lg text-[#111111]">{selectedProduct.name}</h3>
                  <p className="text-sm text-[#382A3A]/60 mb-1">{selectedProduct.category}</p>
                  <p className="font-medium text-[#111111]">₹{selectedProduct.price}</p>
                  <p className="text-xs text-[#382A3A]/40 mt-2">ID: {selectedProduct._id}</p>
                </div>
              </div>
              
              <div className="bg-[#FFFAF3] rounded-lg p-4 flex justify-between items-center mb-6 border">
                <div className="text-sm text-[#382A3A]/70">Current Stock</div>
                <div className="text-2xl font-bold text-[#111111]">{selectedProduct.countInStock}</div>
              </div>

              <div className="bg-[#D8C9FF]/20 text-blue-800 text-xs p-4 rounded-lg flex gap-3 items-start border border-blue-100">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-[#382A3A]" />
                <p><strong>Inventory is controlled by successful order/payment transactions.</strong> Stock is strictly deducted only once per order, upon successful payment validation.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST MODAL */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="absolute inset-0 z-50 flex items-start justify-center p-4 pt-32" style={{ minHeight: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-[#FFFAF3] rounded-xl shadow-2xl overflow-hidden sticky top-32" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-[#111111] m-0">Adjust Stock</h2>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-[#382A3A]/40 hover:text-[#382A3A]/70">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdjustStockSubmit} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-[#382A3A]/70 mb-1">Product</p>
                <p className="font-medium text-[#111111] line-clamp-1">{selectedProduct.name}</p>
              </div>
              
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <p className="text-sm text-[#382A3A]/70 mb-1">Current</p>
                  <div className="bg-[#D8C9FF]/20 p-3 rounded font-bold text-[#382A3A]/60 border">
                    {selectedProduct.countInStock}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-[#382A3A]/70 mb-1 block">New Value</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full border p-3 rounded font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E35336]"
                    value={adjustStockValue}
                    onChange={(e) => setAdjustStockValue(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 border rounded text-sm font-bold text-[#382A3A]/70 hover:bg-[#FFFAF3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-[#111111] text-white rounded text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
