import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { LogOut, ChevronRight, Edit2, MapPin, Trash } from "lucide-react";
import Navbar from "../components/Navbar";
import { logout, userUpdate } from "../Redux/Slices/authSlice";
import { fetchMyOrders } from "../Redux/Slices/orderSlice.js";
import { toast } from "react-toastify";
import OrderTimeline from "../components/OrderTimeline.jsx";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orders, loading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth || {});
  const addresses = user?.addresses || [];
  const [activeTab, setActiveTab] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const submitPasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      await api.post(
        "/auth/change-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setPasswordSuccess("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Password update failed");
    }
  };

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
  };

  const addAddressHandler = async () => {
    const { data } = await api.post("/auth/address", addressForm, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    toast.success("Address added successfully");

    dispatch(
      userUpdate({
        ...user,
        addresses: data, // because your backend returns array
      }),
    );

    setShowForm(false);
  };

  const deleteAddressHandler = async (id) => {
    const { data } = await api.delete(`/auth/address/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    toast.success("Address deleted successfully");

    dispatch(
      userUpdate({
        ...user,
        addresses: data,
      }),
    );
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "orders") {
      dispatch(fetchMyOrders());
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveProfileHandler = () => {
    dispatch(
      userUpdate({
        ...user,
        name: formData.name,
        phone: formData.phone,
      }),
    );
    setIsEditing(false);
  };

  const logoutHandler = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!user) return null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#FFFAF3] pt-32 md:pt-48">
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-12">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl text1 md:text-5xl font-serif">
                My Account
              </h1>
              <p className="text-[#6B7280] text mt-2">
                Manage your profile and preferences
              </p>
            </div>
            <button
              onClick={logoutHandler}
              className="p-3 hover:bg-[#EAEAEA]/20 text rounded-full"
            >
              <LogOut />
            </button>
          </div>
        </section>

        <section className="px-6 md:px-12 max-w-7xl mx-auto pb-24">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 border-l text pl-4 space-y-2">
              {["account", "orders", "addresses"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`block w-full text-left py-3 px-4 ${
                    activeTab === tab
                      ? "border-l-2 border-[#111111] -ml-4 pl-3"
                      : "text-[#6B7280]"
                  }`}
                >
                  {tab === "account" && "Account Information"}
                  {tab === "orders" && "Order History"}
                  {tab === "addresses" && "Saved Addresses"}
                </button>
              ))}
            </div>

            <div className="lg:col-span-3">
              {activeTab === "account" && (
                <div className="space-y-8">
                  <div className="border-b pb-8">
                    <div className="flex justify-between mb-6">
                      <h2 className="text-2xl font-serif text1">
                        Personal Information
                      </h2>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex text items-center gap-2 text-xs uppercase"
                      >
                        <Edit2 size={14} />
                        {isEditing ? "Cancel" : "Edit"}
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 text">
                      {isEditing ? (
                        <>
                          <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="border-b py-2"
                            placeholder="Full Name"
                          />
                          <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="border-b py-2"
                            placeholder="Phone"
                          />
                        </>
                      ) : (
                        <>
                          <Info label="Full Name" value={user.name} />
                          <Info label="Email" value={user.email} />
                          <Info
                            label="Phone"
                            value={user.phone || "Not added"}
                          />
                          <Info
                            label="Member Since"
                            value={new Date(user.createdAt).toDateString()}
                          />
                        </>
                      )}
                    </div>

                    {isEditing && (
                      <button
                        onClick={saveProfileHandler}
                        className="mt-8 bg-[#A8C7F0] text-[#382A3A] px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#A8C7F0] transition-colors"
                      >
                        Save Changes
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl text1 font-serif mb-6">
                      Password & Security
                    </h3>

                    {!showPasswordForm ? (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="flex items-center gap-2 text text-xs uppercase tracking-widest"
                      >
                        Change Password
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="max-w-md space-y-4 mt-6">
                        {passwordError && (
                          <p className="text-sm text text-[#A8C7F0]">
                            {passwordError}
                          </p>
                        )}
                        {passwordSuccess && (
                          <p className="text-sm text text-green-600">
                            {passwordSuccess}
                          </p>
                        )}

                        <input
                          type="password"
                          name="currentPassword"
                          placeholder="Current Password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full border text px-4 py-3"
                        />

                        <input
                          type="password"
                          name="newPassword"
                          placeholder="New Password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full border text px-4 py-3"
                        />

                        <input
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm New Password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full border text px-4 py-3"
                        />

                        <div className="flex gap-4 pt-2">
                          <button
                            onClick={submitPasswordChange}
                            className="bg-[#A8C7F0] text-[#382A3A] px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#A8C7F0] transition-colors"
                          >
                            Update Password
                          </button>
                          <button
                            onClick={() => setShowPasswordForm(false)}
                            className="px-8 text1 py-3 border text-xs uppercase"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  <h2 className="text-2xl text1 text1 font-serif mb-8">
                    Order History
                  </h2>

                  {loading && <p>Loading orders...</p>}

                  {!loading && orders.length === 0 && (
                    <p className="text-[#6B7280]">
                      You haven’t placed any orders yet.
                    </p>
                  )}

                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="border text p-6 hover:shadow-md transition"
                      >
                        {/* HEADER */}
                        <div className="flex justify-between mb-4">
                          <div>
                            <p className="text-xs uppercase text-[#6B7280]">
                              Order ID
                            </p>
                            <p className="font-medium">{order._id}</p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs uppercase text-[#6B7280]">
                              Status
                            </p>
                            <p className="font-semibold text-green-600">
                              {order.status}
                            </p>
                          </div>
                        </div>

                        {/* ✅ TIMELINE — ONLY ONCE */}
                        <OrderTimeline status={order.status} />

                        {/* PRODUCTS */}
                        <div className="flex gap-6 mt-6 overflow-x-auto">
                          {order.orderItems.map((item, i) => (
                            <div
                              key={i}
                              className="flex gap-3 items-center min-w-[180px]"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-20 object-cover border"
                              />
                              <div className="text-sm">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-[#6B7280]">Qty: {item.qty}</p>
                                <p className="text-[#6B7280]">₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* FOOTER */}
                        <div className="grid grid-cols-3 border-t pt-4 mt-6 text-sm">
                          <div>
                            <p className="text-[#6B7280]">Date</p>
                            <p>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6B7280]">Items</p>
                            <p>{order.orderItems.length}</p>
                          </div>
                          <div>
                            <p className="text-[#6B7280]">Total</p>
                            <p className="font-semibold">₹{order.totalPrice}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-serif text1">
                      Saved Addresses
                    </h2>
                    <button
                      onClick={() => setShowForm(!showForm)}
                      className="text-xs text uppercase tracking-widest"
                    >
                      + Add Address
                    </button>
                  </div>

                  {showForm && (
                    <div className="border p-6 space-y-4">
                      <input
                        name="name"
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={handleAddressChange}
                        className="w-full text border px-4 py-2"
                      />
                      <input
                        name="phone"
                        placeholder="Phone"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        className="w-full text border px-4 py-2"
                      />
                      <input
                        name="address"
                        placeholder="Address"
                        value={addressForm.address}
                        onChange={handleAddressChange}
                        className="w-full text border px-4 py-2"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          name="city"
                          placeholder="City"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          className="border text px-4 py-2"
                        />
                        <input
                          name="state"
                          placeholder="State"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                          className="border text px-4 py-2"
                        />
                      </div>
                      <input
                        name="postalCode"
                        placeholder="Postal Code"
                        value={addressForm.postalCode}
                        onChange={handleAddressChange}
                        className="w-full text border px-4 py-2"
                      />

                      <button
                        onClick={addAddressHandler}
                        className="bg-[#A8C7F0] text-[#382A3A] px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#A8C7F0] transition-colors !py-2 !px-6"
                      >
                        Save Address
                      </button>
                    </div>
                  )}

                  {addresses.length === 0 ? (
                    <div className="border text1 p-6 flex gap-3">
                      <MapPin />
                      <p>No addresses saved</p>
                    </div>
                  ) : (
                    addresses.map((a) => (
                      <div
                        key={a._id}
                        className="border p-6 flex justify-between"
                      >
                        <div>
                          <p className="font-medium text1">{a.name}</p>
                          <p className="text-sm text">{a.address}</p>
                          <p className="text-sm text">
                            {a.city}, {a.state} - {a.postalCode}
                          </p>
                          <p className="text-sm text">{a.phone}</p>
                        </div>

                        <button
                          onClick={() => deleteAddressHandler(a._id)}
                          className="text-[#A8C7F0]  text-xs uppercase"
                        >
                          <Trash className="hover:cursor-pointer hover:transition hover:scale-110" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase text1 text-[#6B7280] mb-2">{label}</p>
    <p className="text-lg">{value}</p>
  </div>
);

export default ProfilePage;
