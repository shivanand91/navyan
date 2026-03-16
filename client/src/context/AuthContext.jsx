import { createContext, useContext, useEffect, useState } from "react";
import api, {
  getStoredAccessToken,
  setAccessToken,
  setUnauthorizedHandler
} from "@/lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredAccessToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setToken(null);
      setUser(null);
    });

    const bootstrapAuth = async () => {
      const persistedToken = getStoredAccessToken();

      if (persistedToken) {
        setAccessToken(persistedToken);
        setToken(persistedToken);
      }

      try {
        const meResponse = await api.get("/auth/me");
        setUser(meResponse.data.user);
      } catch {
        try {
          const { data } = await api.post("/auth/refresh");
          setAccessToken(data.accessToken);
          setToken(data.accessToken);
          setUser(data.user);
        } catch {
          setAccessToken(null);
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = (jwt, userData) => {
    setAccessToken(jwt);
    setToken(jwt);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Local cleanup still applies if the API call fails.
    } finally {
      setAccessToken(null);
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
