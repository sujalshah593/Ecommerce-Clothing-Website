import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toastSuccess } from "../utils/toast";
import { Eye, EyeClosed } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

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

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
      });

      login(data);
      toastSuccess("Account created successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1700);
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const googleSignup = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3ee] px-4 relative">
      <Link
        to="/"
        className="absolute top-6 text left-6 text-sm text-[#111111] hover:underline"
      >
        ← Back to store
      </Link>
      <div className="w-full max-w-md">
        <h1 className="text-3xl text1 font-serif text-center mb-2">
          Create an Account
        </h1>

        <p className="text-sm text text-[#111111] text-center mb-6">
          Enter your details below to create your account
        </p>
        <form onSubmit={submitHandler} className="space-y-4">
          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text1 text-sm font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="John"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                required
                className="w-full px-3 text py-2 border border-[#EAEAEA]/30 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#E35336]"
              />
            </div>

            <div>
              <label className="block text1 text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
                className="w-full px-3 text py-2 border border-[#EAEAEA]/30 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#E35336]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text1">
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-3 py-2 border text  border-[#EAEAEA]/30 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#E35336]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full px-3 py-2 pr-10 border text border-[#EAEAEA]/30 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#E35336]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111111] hover:text-[#111111] focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#111111] text1 text-[#FFFFFF] font-medium transition hover:bg-[#B76E4D] transition-colors"
          >
            Create Account
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-[#EAEAEA]/30" />
          <span className="px-2 text text-xs text-[#6B7280] uppercase">
            Or sign up with
          </span>
          <div className="flex-grow border-t border-[#EAEAEA]/30" />
        </div>
        <button
          onClick={googleSignup}
          className="w-full py-3 text1 border border-[#EAEAEA]/30 bg-transparent font-medium hover:bg-[#EAEAEA]/20 transition flex items-center justify-center gap-2"
        >
          <FcGoogle size={22} />
          Continue with Google
        </button>
        <p className="text-xs text text-center text-[#111111] mt-6">
          By clicking continue, you agree to our{" "}
          <span className="underline cursor-pointer text-blue-600">
            <Link to="/privacy-policy">Terms of Service</Link>
          </span>{" "}
          and{" "}
          <span className="underline cursor-pointer text-blue-600">
            <Link to="/privacy-policy">Privacy Policy</Link>
          </span>
          .
        </p>

        <p className="text-sm text text-center text-[#111111] mt-4">
          Already have an account?{" "}
          <Link to="/login" className="underline hover:text-[#111111]">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
