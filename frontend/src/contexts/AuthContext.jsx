/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const { userId, role, exp } = jwtDecode(token);
        if (Date.now() < exp * 1000) {
          setUser({ id: userId, role, token });
        } else {
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    const { userId, role } = jwtDecode(data.token);
    setUser({ id: userId, role, token: data.token });
  };

  const register = async (username, email, password) => {
    await api.post("/auth/register", { username, email, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
