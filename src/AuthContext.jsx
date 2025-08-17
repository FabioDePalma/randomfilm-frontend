// AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login } from './services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Stato di caricamento iniziale

  // Inizializzazione al mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');
    const storedUserEmail = localStorage.getItem('userEmail');

    if (storedToken && storedUsername) {
      setToken(storedToken);
      setUser({ 
        id: storedUserId, 
        username: storedUsername, 
        email: storedUserEmail 
      });
    }
    setLoading(false);
  }, []);

  const handleLogin = useCallback(async (username, password) => {
    try {
      const data = await login(username, password);
      
      // Salva tutti i dati nel localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('userEmail', data.email);
      
      setToken(data.token);

      setUser({ 
        id: data.id, 
        username: data.username, 
        email: data.email 
      });
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const handleLogout = useCallback(() => {
    // Rimuovi tutti i dati dal localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    handleLogin,
    handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
