import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, logoutApi, refreshApi, getMeApi } from '../api/auth.api.js';
import { setAccessToken, clearAccessToken } from '../api/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await refreshApi();
        setAccessToken(res.data.data.accessToken);
        const meRes = await getMeApi();
        setUser(meRes.data.data);
      } catch {
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginApi({ email, password });
    const { user: userData, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    }
    clearAccessToken();
    setUser(null);
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
    isGymAdmin: user?.role === 'GYM_ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
