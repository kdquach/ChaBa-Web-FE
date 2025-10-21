import apiClient from "./client";

// Lấy danh sách danh mục (có thể không phân trang)
export const getCategories = async (params) => {
  const data = await apiClient.get("/categories", { params });
  return data; // kỳ vọng { results: [...] }
};

// Lấy chi tiết danh mục theo ID
export const getCategoryById = async (id) => {
  const data = await apiClient.get(`/categories/${id}`);
  return data;
};

// Tạo danh mục mới
export const createCategory = async (payload) => {
  const data = await apiClient.post("/categories", payload);
  return data;
};

// Cập nhật danh mục
export const updateCategory = async (id, payload) => {
  const data = await apiClient.patch(`/categories/${id}`, payload);
  return data;
};

// Xóa danh mục
export const deleteCategory = async (id) => {
  const data = await apiClient.delete(`/categories/${id}`);
  return data;
};
