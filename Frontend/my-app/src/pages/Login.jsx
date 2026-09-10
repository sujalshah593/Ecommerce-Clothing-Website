import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeClosed } from "lucide-react";
import { useEffect } from "react";
import loginBanner from "../assets/login_banner.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpData, setOtpData] = useState(null);
  const [resetToken, setResetToken] = useState("");
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

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

  const submitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpHandler = async () => {
    try {
      await api.post("/auth/verify-otp", { userId: otpData.userId, otp });
      toast.success("OTP verified. Please sign in.");
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
    <div className="h-screen flex overflow-hidden bg-white">

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ LEFT: Form Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="flex flex-col justify-center w-full lg:w-[52%] px-8 overflow-y-auto items-center">


        <div className="max-w-sm w-full">

          {/* Heading */}
          <h1 className="text-4xl font-bold text-black mb-1">
            {step === "LOGIN" && "Welcome Back!"}
            {step === "FORGOT" && "Forgot Password"}
            {step === "RESET" && "Reset Password"}
            {step === "OTP" && "Verify OTP"}
          </h1>
          <p className="text-sm font-light text-gray-400 mb-8">
            {step === "LOGIN" && "Sign in to your account"}
            {step === "FORGOT" && "Enter your registered email"}
            {step === "RESET" && "Enter your new password"}
            {step === "OTP" && "Enter the OTP sent to your email"}
          </p>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ LOGIN Ã¢â€â‚¬Ã¢â€â‚¬ */}
          {step === "LOGIN" && (
            <form onSubmit={submitHandler} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="sujal123"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                    {showPassword ? <EyeClosed size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none font-light">
                  <input type="checkbox" className="accent-blue-600 w-4 h-4" />
                  Remember Me
                </label>
                <button type="button" onClick={() => setStep("FORGOT")}
                  className="text-gray-500 hover:text-blue-600 hover:underline transition-colors font-light">
                  Forgot Password?
                </button>
              </div>

              <button type="submit" disabled={loading}
                className={`w-full rounded-md py-2.5 text-white font-semibold text-sm transition-colors ${
                  loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
                {loading ? "Signing In..." : "Login"}
              </button>

              {/* Instant Login divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-grow border-t border-gray-200" />
                <span className="text-xs font-light text-gray-400 whitespace-nowrap">Instant Login</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              {/* Google */}
              <button type="button" onClick={googleLogin}
                className="w-full border border-gray-300 rounded-md py-2.5 text-sm text-black flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <FcGoogle size={19} />
                Login with Google
              </button>

              <p className="text-sm font-light text-center text-gray-500 pt-1">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register Now</Link>
              </p>
            </form>
          )}

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ FORGOT Ã¢â€â‚¬Ã¢â€â‚¬ */}
          {step === "FORGOT" && (
            <form onSubmit={forgotHandler} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Registered Email</label>
                <input type="email" placeholder="name@example.com" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <button type="submit" className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm">
                Continue
              </button>
              <button type="button" onClick={() => setStep("LOGIN")} className="w-full text-sm text-blue-600 hover:underline">
                 Back to login
              </button>
            </form>
          )}

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ RESET Ã¢â€â‚¬Ã¢â€â‚¬ */}
          {step === "RESET" && (
            <form onSubmit={resetHandler} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <input type="password" placeholder="New password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <button type="submit" className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm">
                Reset Password
              </button>
            </form>
          )}

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ OTP Ã¢â€â‚¬Ã¢â€â‚¬ */}
          {step === "OTP" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">One-Time Password</label>
                <input placeholder="Enter 6-digit OTP" value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-widest" />
              </div>
              <button onClick={verifyOtpHandler}
                className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm">
                Verify OTP
              </button>
              {timer > 0
                ? <p className="text-xs text-center text-gray-400">Resend in <span className="font-semibold text-black">{timer}s</span></p>
                : <button onClick={resendOtpHandler} className="w-full text-sm text-blue-600 hover:underline">Resend OTP</button>
              }
            </div>
          )}

        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ RIGHT: Contained image card Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="hidden lg:flex lg:w-[48%] items-center justify-center bg-white p-4">
        <div className="h-[98vh] w-full overflow-hidden shadow-md">
          <img
            src={loginBanner}
            alt="Shreeji fashion collection"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

    </div>
  );
};

export default Login;
