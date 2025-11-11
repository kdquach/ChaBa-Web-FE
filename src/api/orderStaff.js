// orderStaff.js
import apiClient from './client';

/**
 * 📦 Lấy danh sách đơn hàng (Order) - lọc các tham số rỗng trước khi gửi
 */
export const fetchOrders = async (params = {}) => {
  // Sao chép params và loại bỏ các giá trị rỗng
  const cleaned = {};
  Object.keys(params || {}).forEach((k) => {
    const v = params[k];
    // nếu là chuỗi, trim trước; bỏ nếu rỗng sau trim
    if (typeof v === 'string') {
      if (v.trim() !== '') cleaned[k] = v.trim();
    } else if (v !== undefined && v !== null) {
      cleaned[k] = v;
    }
  });

  // Gọi API với params đã được lọc
  const data = await apiClient.get('/order-staff', { params: cleaned });

  if (Array.isArray(data)) return { results: data };
  if (data.results) return data;
  if (data.data) return { results: data.data };

  return { results: [] };
};

/**
 * 📄 Lấy chi tiết 1 đơn hàng theo ID
 * @param {string} orderId - ID của đơn hàng
 * @returns {Promise<Object>} - Thông tin chi tiết đơn hàng
 */
export const fetchOrderById = async (orderId) => {
  const data = await apiClient.get(`/order-staff/${orderId}`);
  return data;
};

/**
 * 🔁 Cập nhật trạng thái đơn hàng
 * @param {string} orderId - ID của đơn hàng
 * @param {Object} payload - Dữ liệu cập nhật
 * @param {string} payload.newStatus - Trạng thái mới (pending, confirmed, preparing, ready, completed, cancelled)
 * @param {string} [payload.note] - Ghi chú (tuỳ chọn)
 * @returns {Promise<Object>} - Đơn hàng sau khi cập nhật
 */
export const updateOrderStatus = async (orderId, payload) => {
  const data = await apiClient.patch(`/order-staff/${orderId}/status`, payload);
  return data;
};

/**
 * 🧾 Lấy danh sách log thay đổi trạng thái của 1 đơn hàng
 * @param {string} orderId - ID của đơn hàng
 * @returns {Promise<Array<Object>>} - Danh sách log thay đổi
 */
export const fetchOrderLogs = async (orderId) => {
  const data = await apiClient.get(`/order-staff/${orderId}/logs`);
  if (Array.isArray(data)) return { results: data };
  return { results: data?.data || [] };
};

/**
 * ❌ Xóa 1 log thay đổi trạng thái
 * @param {string} logId - ID của log cần xóa
 * @returns {Promise<{message: string}>} - Kết quả xóa
 */
export const deleteOrderLog = async (logId) => {
  const data = await apiClient.delete(`/order-staff/order-logs/${logId}`);
  return data;
};

/**
 * 🗑 Xóa 1 đơn hàng
 * @param {string} orderId - ID của đơn hàng
 * @returns {Promise<{message: string}>} - Kết quả xóa đơn hàng
 */
export const deleteOrder = async (orderId) => {
  const data = await apiClient.delete(`/order-staff/${orderId}`);
  return data;
};
