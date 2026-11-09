import { createContext, useContext, useEffect, useState, useCallback ,type ReactNode } from "react";
import { api, getToken, setToken, clearToken } from "./api";
import type { User } from "./types";


 interface AuthContextValue{
  user:User | null;
  loading:boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}:{children:ReactNode} ) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  // Restore session on page load
  useEffect(() => {
    if (!getToken()) return;
    api
      .me()
      .then((d) => setUser(d.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email:string, password:string) => {
    const d = await api.login({ email, password });
    setToken(d.token);
    setUser(d.user);
  }, []);

  const register = useCallback(async (name:string, email:string, password:string) => {
    const d = await api.register({ name, email, password });
    setToken(d.token);
    setUser(d.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if(ctx === null)
      throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
