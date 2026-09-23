import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toastSuccess } from "../utils/toast";
import { Eye, EyeClosed } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import registerBanner from "../assets/register_banner.jpg";

const Register = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
      });

      toastSuccess("Account created successfully! Please login to verify your email.");
      setTimeout(() => {
        navigate("/login");
      }, 1700);
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white" style={{ fontFamily: "'Plein', sans-serif" }}>

      {/* ── LEFT: Contained image card ── */}
      <div className="hidden lg:flex lg:w-[48%] items-center justify-center bg-white p-4">
        <div className="h-[92vh] w-full  overflow-hidden shadow-md">
          <img
            src={registerBanner}
            alt="Shreeji Archive Sale"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="flex flex-col justify-center w-full lg:w-[52%] px-8 overflow-y-auto items-center relative">


        <div className="max-w-sm w-full">
          <h1 className="text-4xl font-bold text-black mb-1">
            Create an Account
          </h1>
          <p className="text-sm font-light text-gray-400 mb-8">
            Enter your details below to create your account
          </p>

          <form onSubmit={submitHandler} className="space-y-4">
            {/* First + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeClosed size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-full py-2.5 text-white font-semibold text-sm transition-colors ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-grow border-t border-gray-200" />
            <span className="text-xs font-light text-gray-400 whitespace-nowrap">Or sign up with</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={googleSignup}
            className="w-full border border-gray-300 rounded-md py-2.5 text-sm text-black flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <FcGoogle size={19} />
            Continue with Google
          </button>

          <p className="text-xs font-light text-center text-gray-500 mt-4">
            By clicking continue, you agree to our{" "}
            <Link to="/privacy-policy" className="text-blue-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
          </p>

          <p className="text-sm font-light text-center text-gray-500 pt-3">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;
