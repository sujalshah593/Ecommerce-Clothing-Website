import { useState } from "react";
import api from "../../api/axios.js";
import { useNavigate } from "react-router-dom";
import { toastSuccess } from "../../utils/toast.js";

const AddProductPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Apparel",
    targetGroup: "",
    subCategory: "",
    countInStock: "",
    image: "",
    description: "",
  });

  const changeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await api.post("/admin/products", {
        ...form,
        price: Number(form.price),
        countInStock: Number(form.countInStock),
      });

      toastSuccess("Product added successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to add product");
    }
  };

  return (
    <div className="max-w-2xl font-serif mx-auto space-y-8">
      <h1 className="text-3xl font-serif font-bold text-[#111111] text1">
        Add Product
      </h1>

      <form
        onSubmit={submitHandler}
        className="bg-[#FFFAF3] text p-8 rounded-lg space-y-4"
      >
        <input
          name="name"
          placeholder="Product Name"
          onChange={changeHandler}
          className="w-full p-3 bg-[#FFFAF3] text-[#111111] border border-slate-700 rounded"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          onChange={changeHandler}
          className="w-full p-3 bg-[#FFFAF3] text-[#111111] border border-slate-700 rounded"
        />

        <input
          name="category"
          placeholder="Category"
          onChange={changeHandler}
          className="w-full p-3 bg-[#FFFAF3] text-[#111111] border border-slate-700 rounded"
        />
        <input
          name="subCategory"
          placeholder="Sub Category (e.g. Shirts, Jeans)"
          onChange={changeHandler}
          className="w-full p-3 bg-[#FFFAF3] text-[#111111] border border-slate-700 rounded"
        />

        <select
          name="targetGroup"
          value={form.targetGroup}
          onChange={changeHandler}
          required
          className="w-full p-3 bg-[#FFFAF3] text-[#111111] border border-slate-700 rounded"
        >
          <option value="">Select Target Group</option>
          <option value="Men">Men</option>
          <option value="Boys">Boys</option>
        </select>

        <input
          name="countInStock"
          type="number"
          placeholder="Stock"
          onChange={changeHandler}
          className="w-full p-3 bg-[#FFFAF3] text-[#111111] border border-slate-700 rounded"
        />

        <input
          name="image"
          placeholder="Image URL"
          onChange={changeHandler}
          className="w-full p-3 bg-[#FFFAF3] text-[#111111] border border-slate-700 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={changeHandler}
          className="w-full p-3 bg-[#FFFAF3] text-[#111111] border border-slate-700 rounded"
        />

        <button className="w-full bg-[#A8C7F0] text-[#382A3A] px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#A8C7F0] transition-colors">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
