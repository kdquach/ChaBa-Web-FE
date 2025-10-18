import axios from "axios";
import { message } from "antd";
import { getAccessToken, clearAuth } from "../utils/auth";

// Cấu hình base URL - có thể thay đổi theo môi trường
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/v1";

// Tạo axios instance với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Tăng timeout lên 30s để xử lý mạng chậm
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Tắt credentials mode tạm thời để fix CORS
});

// Request interceptor - thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý response và lỗi chung
apiClient.interceptors.response.use(
  (response) => {
    // Trả về dữ liệu từ response
    return response.data;
  },
  (error) => {
    const { response } = error;
    const config = error?.config || {};
    // ⛔ Nếu request có flag silentError thì không hiển thị message
    if (config?.silentError) {
      return Promise.reject(error);
    }
    // Xử lý các trường hợp lỗi khác nhau
    if (response) {
      const { status, data } = response;

      switch (status) {
        case 400:
          message.error(data.message || "Dữ liệu không hợp lệ");
          break;

        case 401:
          // Unauthorized - clear auth data và redirect về login
          clearAuth();
          break;

        case 403:
          message.error(
            data.message || "Bạn không có quyền thực hiện thao tác này"
          );
          break;

        case 404:
          message.error(data.message || "Không tìm thấy tài nguyên yêu cầu");
          break;

        case 422:
          // Xử lý lỗi validation
          const validationErrors = data.errors;
          if (validationErrors) {
            Object.values(validationErrors).forEach((error) => {
              message.error(error[0]);
            });
          } else {
            message.error(data.message || "Dữ liệu không hợp lệ");
          }
          break;

        case 500:
          message.error("Lỗi hệ thống, vui lòng thử lại sau");
          break;

        default:
          message.error(data.message || "Có lỗi xảy ra");
          break;
      }
    } else if (error.code === "ECONNABORTED") {
      message.error("Timeout - vui lòng kiểm tra kết nối mạng");
    } else {
      message.error("Lỗi kết nối, vui lòng thử lại");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
