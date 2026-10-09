import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const AuthContext = createContext({ user: null, ready: false, login: () => {}, logout: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.token && parsed?.id) setUser(parsed);
      else localStorage.removeItem('user');
    } catch {
      localStorage.removeItem('user');
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('learnmate:unauthorized', onUnauthorized);
    return () => window.removeEventListener('learnmate:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback((userData) => {
    if (!userData?.token || !userData?.id) throw new Error('The server returned an incomplete session.');
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);
  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
