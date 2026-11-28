import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Trash2, Eye } from "lucide-react";
import api from "../../api/axios.js";
import { Link } from "react-router-dom";
import Pagination from "../../components/Pagination.jsx";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    api.get("/admin/products").then((res) => setProducts(res.data));
  }, []);

  const deleteHandler = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await api.delete(`/admin/products/${id}`);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const updateHandler = async (p) => {
    const name = prompt("Name", p.name);
    const price = prompt("Price", p.price);
    const image = prompt("Image URL", p.image);
    if (!name || !price) return;

    const { data } = await api.put(`/admin/products/${p._id}`, {
      name,
      price: Number(price),
      image,
    });

    setProducts((prev) => prev.map((x) => (x._id === p._id ? data : x)));
  };

  const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  const paginatedProducts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (!products) return <TruckLoader />;
  return (
    <div className="admin-page products-page space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#111111] text1">Products</h1>
          <p className="text-slate-500 mt-2 text">Manage your product inventory</p>
        </div>
        <Link
          to="/admin/add-product"
          className="inline-flex items-center gap-2 rounded-lg bg-[#A8C7F0] px-4 py-3 text-sm font-semibold text-[#382A3A] transition-colors hover:bg-[#8FB8EC]"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute font-serif left-4 top-1/2 -translate-y-1/2 text-[#111111]" />
        <input
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          placeholder="Search by name or id..."
          className="w-full pl-12 font-serif pr-4 py-3 bg-[#FFFAF3] border text border-slate-700 rounded-lg text-[#111111]"
        />
      </div>

      <div className="bg-[#FFFAF3] font-serif rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full ">
          <thead className="bg-[#FFFAF3] text1">
            <tr>
              <th className="px-6 py-4 text-left">Image</th>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-left">Price</th>
              <th className="px-6 py-4 text-left">Stock</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((p) => (
              <tr
                key={p._id}
                className="border-b text border-slate-700 hover:bg-slate-700/50"
              >
                <td className="px-6 py-4">
                  <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-md" />
                </td>
                <td className="px-6 py-4">{p.name}</td>
                <td className="px-6 py-4">{p.category || "-"}</td>
                <td className="px-6 py-4">₹{p.price}</td>
                <td className="px-6 py-4">{p.countInStock}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button>
                    <Eye size={16} />
                  </button>
                  <button onClick={() => updateHandler(p)}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteHandler(p._id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={currentPage} pageSize={pageSize} total={filtered.length} onPageChange={setCurrentPage} label="products" />
    </div>
  );
};

export default ProductsPage;
