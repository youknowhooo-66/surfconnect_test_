import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const API_BASE_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from localStorage on start
  useEffect(() => {
    const storedUser = localStorage.getItem('surfconnect_user');
    const storedToken = localStorage.getItem('surfconnect_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao realizar login.');
      }

      // Save to state
      setUser(data.user);
      setToken(data.token);

      // Save to localStorage
      localStorage.setItem('surfconnect_user', JSON.stringify(data.user));
      localStorage.setItem('surfconnect_token', data.token);

      return data.user;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao registrar usuário.');
      }

      return data;
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('surfconnect_user');
    localStorage.removeItem('surfconnect_token');
  };

  // Helper function to make authenticated requests
  const apiRequest = async (endpoint, options = {}) => {
    const activeToken = token || localStorage.getItem('surfconnect_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      // Automatic logout on unauthorized/expired token
      logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição da API.');
    }

    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register: registerUser, logout, apiRequest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
