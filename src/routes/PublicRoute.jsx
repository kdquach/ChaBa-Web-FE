import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Component cho các route công khai (như login)
 * Nếu user đã đăng nhập thì chuyển hướng về dashboard
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Nếu đã đăng nhập, chuyển hướng về dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;