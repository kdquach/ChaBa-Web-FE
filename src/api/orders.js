import apiClient from './client';

// Lấy danh sách đơn hàng
export const getOrders = async (params = {}) => {
  // Gọi API thật để lấy danh sách đơn hàng (phân trang)
  const res = await apiClient.get('/orders', { params });
  // Chuẩn hóa theo UI đang dùng
  const { results, totalResults, totalPages, page, limit, data } = res || {};
  if (Array.isArray(data)) {
    // Trường hợp backend trả { data, page, limit, totalResults, totalPages }
    return {
      data,
      pagination: {
        current: page || 1,
        pageSize: limit || params.limit || 10,
        total: totalResults ?? data.length,
        totalPages: totalPages || 1,
      },
    };
  }
  // Trường hợp backend trả { results, page, limit, totalResults, totalPages }
  return {
    data: results || [],
    pagination: {
      current: page || 1,
      pageSize: limit || params.limit || 10,
      total: totalResults || 0,
      totalPages: totalPages || 0,
    },
  };
};

// Lấy chi tiết đơn hàng
export const getOrder = async (id) => {
  const data = await apiClient.get(`/orders/${id}`);
  return data;
};

// Tạo đơn hàng mới
export const createOrder = async (data) => {
  const res = await apiClient.post('/orders', data);
  return res;
};

// Cập nhật đơn hàng
export const updateOrder = async (id, data) => {
  const res = await apiClient.patch(`/orders/${id}`, data);
  return res;
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (id, status) => {
  const res = await apiClient.patch(`/orders/${id}/status`, { status });
  return res;
};

// Thống kê đơn hàng
export const getOrderStats = async () => {
  // Endpoint gợi ý: /orders/stats
  const data = await apiClient.get('/orders/stats');
  return data;
};

// Phân tích doanh thu theo khoảng thời gian và nhóm theo day|month|year
export const getRevenueAnalytics = async ({ from, to, groupBy = 'day' } = {}) => {
  // Endpoint gợi ý: /analytics/revenue
  const params = { from, to, groupBy };
  const data = await apiClient.get('/analytics/revenue', { params });
  return data;
};

// Top sản phẩm bán chạy theo số lượng trong khoảng thời gian
export const getTopProducts = async ({ from, to, limit = 10 } = {}) => {
  // Endpoint gợi ý: /analytics/top-products
  const params = { from, to, limit };
  const data = await apiClient.get('/analytics/top-products', { params });
  return data;
};
