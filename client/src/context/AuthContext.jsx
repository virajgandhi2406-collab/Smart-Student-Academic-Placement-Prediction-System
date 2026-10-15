import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('edupredict_token'));
  const [loading, setLoading] = useState(true);

  // Load current user profile on mount
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('edupredict_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('edupredict_token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('edupredict_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('edupredict_token');
    setToken(null);
    setUser(null);
  };

  // One-click demo account switcher for rapid evaluator inspection
  const quickSwitchRole = async (targetEmail) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: 'EduPredict@2026' })
      });
      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Quick switch failed:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, quickSwitchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
