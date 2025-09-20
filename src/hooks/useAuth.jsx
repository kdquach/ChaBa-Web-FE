import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
import {
  getAccessToken,
  setTokens,
  setUser as setStoredUser,
  clearAuth,
  getUser as getStoredUser,
} from "../utils/auth";
import * as authAPI from "../api/auth";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  // Kiểm tra token khi app khởi động
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          // Verify token với server
          const response = await authAPI.verifyToken();
          if (response?.user) {
            setUser(response.user);
            setStoredUser(response.user);
          } else {
            throw new Error("Invalid response format");
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          clearAuth();
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Đăng nhập
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      console.log(response);
      if (!response?.user || !response?.tokens?.access?.token) {
        throw new Error("Invalid response format");
      }

      // Lưu thông tin user và tokens
      setUser(response.user);
      setStoredUser(response.user);
      setTokens(response.tokens);

      message.success("Đăng nhập thành công!");
      return { success: true };
    } catch (error) {
      message.error(error.message || "Đăng nhập thất bại");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = () => {
    try {
      // Reset user state và xóa auth data
      setUser(null);
      clearAuth();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Cập nhật thông tin user
  const updateUser = (userData) => {
    const newUserData = { ...user, ...userData };
    setUser(newUserData);
    setStoredUser(newUserData);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
