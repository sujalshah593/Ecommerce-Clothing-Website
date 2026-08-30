import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeClosed } from "lucide-react";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("LOGIN"); // LOGIN | OTP | FORGOT | RESET
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpData, setOtpData] = useState(null);
  const [resetToken, setResetToken] = useState("");
  const [timer, setTimer] = useState(60);
  const location = useLocation();


  /* ================= TIMER ================= */
  const startTimer = () => {
    let t = 60;
    setTimer(t);
    const i = setInterval(() => {
      t--;
      setTimer(t);
      if (t === 0) clearInterval(i);
    }, 1000);
  };

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const token = params.get("resetToken");

  if (token) {
    setResetToken(token);
    setStep("RESET");
  }
}, [location.search]);


  /* ================= LOGIN ================= */
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      if (err.response?.data?.requiresOtp) {
        setOtpData(err.response.data);
        setStep("OTP");
        startTimer();
        toast.success("OTP sent to email");
      } else {
        toast.error(err.response?.data?.message || "Login failed");
      }
    }
  };

  /* ================= OTP ================= */
  const verifyOtpHandler = async () => {
    try {
      await api.post("/auth/verify-otp", {
        userId: otpData.userId,
        otp,
      });
      toast.success("OTP verified. Login again.");
      setStep("LOGIN");
      setOtp("");
    } catch {
      toast.error("Invalid OTP");
    }
  };

  const resendOtpHandler = async () => {
    try {
      await api.post("/auth/resend-otp", { email });
      startTimer();
      toast.success("OTP resent");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  /* ================= FORGOT ================= */
  const forgotHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setResetToken(data.token);
      setStep("RESET");
      toast.success("Reset link verified");
    } catch {
      toast.error("Email not found");
    }
  };

  /* ================= RESET ================= */
  const resetHandler = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/auth/reset-password/${resetToken}`, { password });
      toast.success("Password reset successful");
      setPassword("");
      setStep("LOGIN");
    } catch {
      toast.error("Invalid or expired token");
    }
  };

  const googleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3ee] px-4">
      <Link to="/" className="absolute text top-6 left-6 text-sm text-[#111111] hover:underline" > ← Back to store </Link>
      <div className="w-full max-w-sm">
        <h1 className="text-3xl text1 font-serif text-center mb-6">
          {step === "LOGIN" && "Welcome Back"}
          {step === "FORGOT" && "Forgot Password"}
          {step === "RESET" && "Reset Password"}
          {step === "OTP" && "Verify OTP"}
        </h1>
        <p className="text text-center mt-[-12px] mb-4"> Log in to continue shopping with ease </p>

        {/* ================= LOGIN ================= */}
        {step === "LOGIN" && (
          <form onSubmit={submitHandler} className="space-y-4">
            <label className="block text-sm font-medium mb-1 text1">Email</label>
            <input
              type="email"
              placeholder="Email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text border px-3 py-2"
            />

            <div className="relative">
               <label className="block text-sm font-medium mb-1 text1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border text px-3 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-11 -translate-y-1/2"
              >
                {showPassword ? <EyeClosed /> : <Eye />}
              </button>
            </div>

            <button className="w-full text1 bg-[#111111] text-[#FFFFFF] py-3 hover:bg-[#B76E4D] transition-colors">
              Sign In
            </button>

            <button
              type="button"
              onClick={() => setStep("FORGOT")}
              className="text-sm text underline w-full"
            >
              Forgot password?
            </button>
          </form>
        )}

        {step === "FORGOT" && (
          <form onSubmit={forgotHandler} className="space-y-4">
            <input
              type="email"
              placeholder="Registered email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text border px-3 py-2"
            />
            <button className="w-full text1 bg-[#111111] text-[#FFFFFF] py-3 hover:bg-[#B76E4D] transition-colors">
              Continue
            </button>
            <button
              type="button"
              onClick={() => setStep("LOGIN")}
              className="text-sm text underline w-full"
            >
              Back to login
            </button>
          </form>
        )}

        {/* ================= RESET ================= */}
        {step === "RESET" && (
          <form onSubmit={resetHandler} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border text px-3 py-2"
            />
            <button className="w-full text1 bg-[#111111] text-[#FFFFFF] py-3 hover:bg-[#B76E4D] transition-colors">
              Reset Password
            </button>
          </form>
        )}

        {/* ================= OTP ================= */}
        {step === "OTP" && (
          <div className="space-y-4">
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text border px-3 py-2"
            />
            <button
              onClick={verifyOtpHandler}
              className="w-full text1 bg-[#111111] text-[#FFFFFF] py-3 hover:bg-[#B76E4D] transition-colors"
            >
              Verify OTP
            </button>

            {timer > 0 ? (
              <p className="text-xs text text-center">Resend in {timer}s</p>
            ) : (
              <button
                onClick={resendOtpHandler}
                className="text-xs underline w-full"
              >
                Resend OTP
              </button>
            )}
          </div>
        )}

        {step === "LOGIN" && (
          <>
            <div className="flex items-center my-6">
              <div className="flex-grow border-t" />
              <span className="px-2 text-xs text">OR</span>
              <div className="flex-grow border-t" />
            </div>

            <button
              onClick={googleLogin}
              className="w-full border py-3 text1 flex justify-center gap-2"
            >
              <FcGoogle /> Continue with Google
            </button>
          </>
        )}

        <p className="text-sm text text-center mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
