import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("expense-token"),
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token]);
  async function authenticate(path, payload) {
    const data = await api(path, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.setItem("expense-token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }
  const login = (email, password) =>
    authenticate("/api/auth/login", { email, password });
  const register = (formData) => authenticate("/api/auth/register", formData);
  function logout() {
    localStorage.removeItem("expense-token");
    setToken(null);
    setUser(null);
  }
  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
