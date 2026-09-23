import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const hasExchanged = useRef(false);

  useEffect(() => {
    const exchangeCode = async () => {
      if (hasExchanged.current) return;
      hasExchanged.current = true;

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        try {
          // Remove code from URL immediately for cleanliness/security
          window.history.replaceState({}, document.title, window.location.pathname);
          const { data } = await api.post("/auth/google/exchange", { code });
          if (data.token) {
            login({ token: data.token });
          } else {
            navigate("/login", { replace: true });
          }
        } catch (error) {
          navigate("/login", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    };

    exchangeCode();
  }, [login, navigate]);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return <p>Signing you in...</p>;
};

export default OAuthCallback;
