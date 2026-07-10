import { createContext, useContext, useState, useCallback } from "react";
import { findUser, addUser, usernameExists } from "../data/userStore";

const AuthContext = createContext(null);

function toSession(found) {
  return {
    id: found.id,
    username: found.username,
    name: found.name,
    email: found.email,
    role: found.role,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((username, password) => {
    const found = findUser(username, password);
    if (!found) return false;
    const userData = toSession(found);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    setUser(userData);
    return true;
  }, []);

  const register = useCallback(({ username, password, name, email }) => {
    if (usernameExists(username)) {
      return { ok: false, error: "Username sudah digunakan" };
    }
    const created = addUser({ username, password, name, email });
    const userData = toSession(created);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    setUser(userData);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
