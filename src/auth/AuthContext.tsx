import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expMs = (payload.exp as number) * 1000;
    return Date.now() >= expMs;
  } catch {
    // Si no se puede parsear, lo tratamos como inválido
    return true;
  }
}

function getInitialToken(): string | null {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  // opcional: si expira, lo eliminamos
  if (isTokenExpired(token)) {
    localStorage.removeItem("accessToken");
    return null;
  }

  return token;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ✅ Se hidrata desde el primer render
  const [token, setToken] = useState<string | null>(() => getInitialToken());

  const value = useMemo<AuthContextType>(() => {
    const login = (newToken: string) => {
      localStorage.setItem("accessToken", newToken);
      setToken(newToken);
    };

    const logout = () => {
      localStorage.removeItem("accessToken");
      setToken(null);
    };

    return {
      token,
      isAuthenticated: !!token,
      login,
      logout,
    };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};