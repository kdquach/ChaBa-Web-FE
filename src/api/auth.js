import apiClient from "./client";

/**
 * Đăng nhập người dùng
 * @param {Object} credentials - Thông tin đăng nhập
 * @param {string} credentials.username - Tên đăng nhập
 * @param {string} credentials.password - Mật khẩu
 * @returns {Promise<{user: Object, token: string}>} - Thông tin người dùng và token
 */
export const login = async (credentials) => {
  try {
    const data = await apiClient.post("/auth/login", credentials);
    if (!data) {
      throw new Error("No data received from server");
    }
    return data;
  } catch (error) {
    // Log lỗi để debug
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Xác thực token và lấy thông tin người dùng
 * @returns {Promise<Object>} - Thông tin người dùng
 */
export const verifyToken = async () => {
  const { data } = await apiClient.get("/auth/verify");
  return data;
};

/**
 * Đăng xuất người dùng
 * @returns {Promise<{success: boolean}>} - Kết quả đăng xuất
 */
export const logout = async () => {
  const response = await apiClient.post("/auth/logout");
  return response;
};

/**
 * Lấy thông tin người dùng hiện tại
 * @returns {Promise<Object>} - Thông tin người dùng
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get("/auth/me");
  return response;
};

/**
 * Cập nhật thông tin cá nhân
 * @param {Object} userData - Dữ liệu cập nhật
 * @param {string} userData.name - Tên người dùng
 * @param {string} userData.email - Email
 * @param {string} [userData.avatar] - URL ảnh đại diện
 * @returns {Promise<Object>} - Thông tin người dùng đã cập nhật
 */
export const updateProfile = async (userData) => {
  const response = await apiClient.put("/auth/profile", userData);
  return response;
};

/**
 * Thay đổi mật khẩu
 * @param {Object} passwordData - Dữ liệu mật khẩu
 * @param {string} passwordData.currentPassword - Mật khẩu hiện tại
 * @param {string} passwordData.newPassword - Mật khẩu mới
 * @returns {Promise<{success: boolean, message: string}>} - Kết quả thay đổi mật khẩu
 */
export const changePassword = async (data) => {
  try {
    const res = await apiClient.patch("/auth/change-password", data);
    return res;
  } catch (error) {
    throw error;
  }
};

/**
 * Yêu cầu đặt lại mật khẩu
 * @param {string} email - Email tài khoản
 * @returns {Promise<{success: boolean, message: string}>} - Kết quả yêu cầu
 */
export const requestPasswordReset = async (email) => {
  const response = await apiClient.post("/auth/forgot-password/send-otp", {
    email,
  });
  return response;
};

/**
 * Đặt lại mật khẩu với token
 * @param {Object} resetData - Dữ liệu đặt lại mật khẩu
 * @param {string} resetData.token - Token đặt lại mật khẩu
 * @param {string} resetData.newPassword - Mật khẩu mới
 * @returns {Promise<{success: boolean, message: string}>} - Kết quả đặt lại mật khẩu
 */
export const resetPassword = async (resetData) => {
  console.log("resetData in auth.js:", resetData);
  const response = await apiClient.post(
    "/auth/reset-password/with-otp",
    resetData
  );
  return response;
};

/**
 * Đăng ký tài khoản mới
 * @param {Object} userData - Thông tin đăng ký
 * @param {string} userData.name - Tên người dùng
 * @param {string} userData.email - Email
 * @param {string} userData.phone - Số điện thoại
 * @param {string} userData.password - Mật khẩu
 * @returns {Promise<{user: Object, tokens: Object}>} - Thông tin người dùng và token
 */
export const register = async (userData) => {
  try {
    const data = await apiClient.post("/auth/register/send-otp", userData);
    if (!data) {
      throw new Error("Không nhận được dữ liệu từ server");
    }
    return data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error;
  }
};
/**
 * Xác thực OTP khi đăng ký
 * @param {Object} verifyData - Dữ liệu xác thực gồm name,email,phone,password,otp (theo API backend)
 * @returns {Promise<Object>} - Response từ server
 */
export const verifyRegisterOtp = async (verifyData) => {
  try {
    const data = await apiClient.post("/auth/register/verify-otp", verifyData);
    if (!data) {
      throw new Error("No data received from server");
    }
    return data;
  } catch (error) {
    console.error("Verify OTP error:", error.response?.data || error.message);
    throw error;
  }
};

/** Xác thực OTP khi quên mật khẩu
 * @param {Object} verifyData - Dữ liệu xác thực gồm email, otp (theo API backend)
 * @returns {Promise<Object>} - Response từ server
 */
export const verifyForgotPasswordOtp = async (verifyData) => {
  try {
    const data = await apiClient.post(
      "/auth/forgot-password/verify-otp",
      verifyData
    );
    if (!data) {
      throw new Error("No data received from server");
    }
    return data;
  } catch (error) {
    console.error("Verify OTP error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Đăng nhập bằng Google
 * @param {Object} googleData - Dữ liệu từ Google
 * @param {string} googleData.accessToken - Google access token
 * @param {Object} googleData.userInfo - Thông tin user từ Google
 * @returns {Promise<{user: Object, tokens: Object}>} - Thông tin người dùng và token
 */
export const loginWithGoogle = async (googleData) => {
  try {
    const data = await apiClient.post("/auth/google", {
      token: googleData.token,
    });

    if (!data) {
      throw new Error("No data received from server");
    }

    return data;
  } catch (error) {
    console.error("Google login error:", error.response?.data || error.message);
    throw error;
  }
};
