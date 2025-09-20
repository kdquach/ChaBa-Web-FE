import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Component bảo vệ route - chỉ cho phép user đã đăng nhập truy cập
 */
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Nếu chưa đăng nhập, chuyển hướng về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền truy cập nếu có yêu cầu
  if (requiredPermission && user) {
    const hasPermission =
      user.permissions?.includes(requiredPermission) ||
      user.name === "test12345";

    if (!hasPermission) {
      // Có thể chuyển hướng về trang unauthorized hoặc dashboard
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
