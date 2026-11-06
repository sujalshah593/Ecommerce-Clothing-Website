import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchCart } from "../Redux/Slices/cartSlice";
import { logout as clearAuth, setUser as setAuthUser } from "../Redux/Slices/authSlice";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const expiryTimer = useRef(null);

  const clearSession = useCallback(() => {
    if (expiryTimer.current) window.clearTimeout(expiryTimer.current);
    localStorage.removeItem("user");
    setUser(null);
    dispatch(clearAuth());
  }, [dispatch]);

  const getTokenExpiry = (token) => {
    try {
      const encodedPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(encodedPayload.padEnd(encodedPayload.length + ((4 - encodedPayload.length % 4) % 4), "=")));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  };

  const scheduleExpiry = useCallback((token) => {
    if (expiryTimer.current) window.clearTimeout(expiryTimer.current);
    const expiry = getTokenExpiry(token);
    if (!expiry) return clearSession();
    const delay = expiry - Date.now();
    if (delay <= 0) return clearSession();
    expiryTimer.current = window.setTimeout(clearSession, delay);
    return () => window.clearTimeout(expiryTimer.current);
  }, [clearSession]);

  useEffect(() => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("user"));
    } catch {
      localStorage.removeItem("user");
    }

    if (!storedUser?.token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return undefined;
    }

    const cleanupExpiry = scheduleExpiry(storedUser.token);
    if (getTokenExpiry(storedUser.token) > Date.now()) {
      setUser(storedUser);
      dispatch(setAuthUser(storedUser));
      dispatch(fetchCart()).catch(() => undefined);
    }
    setLoading(false);
    return cleanupExpiry;
  }, [dispatch, scheduleExpiry]);

  useEffect(() => {
    window.addEventListener("auth:expired", clearSession);
    return () => window.removeEventListener("auth:expired", clearSession);
  }, [clearSession]);

  const login = useCallback((data) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    dispatch(setAuthUser(data));
    scheduleExpiry(data.token);
  }, [dispatch, scheduleExpiry]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// The provider and hook intentionally share this module as the app's auth API.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
