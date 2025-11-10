import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
import {
  getAccessToken,
  setTokens,
  setUser as setStoredUser,
  clearAuth,
  getUser as getStoredUser,
} from "../utils/auth";
import {
  login as loginAPI,
  register as registerAPI,
  verifyToken,
  loginWithGoogle as googleLoginAPI,
} from "../api/auth";

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
          const response = await verifyToken();
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
      const response = await loginAPI(credentials);

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
      console.error("Login error:", error);

      // Lấy thông điệp lỗi chi tiết từ backend (nếu có)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";

      // Hiển thị thông báo lỗi ra màn hình
      message.error(errorMessage);

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await registerAPI(userData);

      // Kiểm tra nếu API có message hợp lệ
      if (!response?.message) {
        throw new Error(
          "Đăng ký thất bại. Không nhận được phản hồi từ server."
        );
      }

      // ✅ Trả về message để component hiển thị hoặc chuyển sang màn OTP
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Đăng ký thất bại";
      throw new Error(errorMessage);
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

  // Cập nhật hàm đăng nhập bằng Google
  const loginWithGoogle = async (googleData) => {
    try {
      setLoading(true);
      const response = await googleLoginAPI(googleData);

      if (!response?.user || !response?.tokens?.access?.token) {
        throw new Error("Invalid Google login response format");
      }

      // Lưu thông tin người dùng và token
      setUser(response.user);
      setStoredUser(response.user);
      setTokens(response.tokens);

      return response;
    } catch (error) {
      console.error("Google login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập Google thất bại";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật context value
  const value = {
    user,
    login,
    register,
    loginWithGoogle, // Đảm bảo có trong context
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
