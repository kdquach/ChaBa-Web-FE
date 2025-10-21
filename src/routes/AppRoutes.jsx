import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Import pages
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProductListPage from "../pages/Products/ProductListPage";
import ProductFormPage from "../pages/Products/ProductFormPage";
import OrderListPage from "../pages/Orders/OrderListPage";
import OrderDetailPage from "../pages/Orders/OrderDetailPage";
import OrderFormPage from "../pages/Orders/OrderFormPage";
import UserListPage from "../pages/Users/UserListPage";
import UserFormPage from "../pages/Users/UserFormPage";
import IngredientListPage from "../pages/Ingredients/IngredientListPage";
import IngredientFormPage from "../pages/Ingredients/IngredientFormPage";
import ToppingListPage from "../pages/Toppings/ToppingListPage";
import ToppingFormPage from "../pages/Toppings/ToppingFormPage";
import GoogleCallback from "../pages/Auth/GoogleCallback";
import ProfilePage from "../pages/Profile/ProfilePage";

const AppRoutes = () => {
  const { loading } = useAuth();

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Route công khai - không cần đăng nhập */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />

      {/* Routes được bảo vệ - cần đăng nhập */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Quản lý sản phẩm */}
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/:mode" element={<ProductFormPage />} />

        {/* Quản lý đơn hàng */}
        <Route path="orders" element={<OrderListPage />} />
        <Route path="orders/new" element={<OrderFormPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="orders/:id/edit" element={<OrderFormPage />} />

        {/* Quản lý người dùng */}
        <Route path="users" element={<UserListPage />} />
        <Route path="users/new" element={<UserFormPage />} />
        <Route path="users/:id/edit" element={<UserFormPage />} />

        {/* Quản lý nguyên liệu */}
        <Route path="ingredients" element={<IngredientListPage />} />
        <Route path="ingredients/new" element={<IngredientFormPage />} />
        <Route path="ingredients/:id/edit" element={<IngredientFormPage />} />

        {/* Quản lý topping */}
        <Route path="toppings" element={<ToppingListPage />} />
        <Route path="toppings/new" element={<ToppingFormPage />} />
        <Route path="toppings/:id/:mode" element={<ToppingFormPage />} />

        {/* Quản lý profile */}
        <Route path="Profile" element={<ProfilePage />} />
      </Route>

      {/* Route mặc định - chuyển hướng về dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
