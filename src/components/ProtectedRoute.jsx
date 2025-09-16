// components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Verificando l'autenticazione...</div>;
  }

  // Se non autenticato, reindirizza al login salvando la posizione corrente
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;