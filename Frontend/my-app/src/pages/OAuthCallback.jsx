import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import TruckLoader from "../components/TruckLoader";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasExchanged = useRef(false);
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    const exchangeCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Remove code/error values before making the request so they cannot be
      // reused from browser history or accidentally submitted twice.
      window.history.replaceState({}, document.title, window.location.pathname);

      if (!code) {
        const message = "Google sign-in did not return an authorization code.";
        setStatus(message);
        toast.error(message);
        navigate("/login", { replace: true, state: { authError: message } });
        return;
      }

      try {
        const { data } = await api.post("/auth/google/exchange", { code });
        if (!data?.token) {
          throw new Error("Google sign-in did not return a valid session.");
        }

        login(data);
        setStatus("Signed in. Redirecting...");
        // Reload through the normal app entry point after persistence so the
        // auth provider and protected routes initialize from the saved session.
        window.location.replace(`${window.location.origin}/`);
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Google sign-in failed.";
        setStatus(message);
        toast.error(message);
        navigate("/login", { replace: true, state: { authError: message } });
      }
    };

    if (hasExchanged.current) return;
    hasExchanged.current = true;
    exchangeCode();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#FFFAF3]">
      <TruckLoader />
      <p className="text-sm text-[#382A3A]/60">{status}</p>
    </div>
  );
};

export default OAuthCallback;
