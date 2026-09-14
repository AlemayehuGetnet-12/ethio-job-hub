"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getApiUrl } from "../api-config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) { setLoading(false); return; }
      const res = await axios.get(getApiUrl("/api/auth/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    const res = await axios.post(getApiUrl("/api/auth/login"), { email, password });
    const { accessToken, refreshToken, user: u } = res.data;
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(getApiUrl("/api/auth/logout"), {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch { /* ignore */ }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }, []);

  const authHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authHeaders, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
