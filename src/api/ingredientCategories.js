import apiClient from './client';

/**
 * Lấy danh sách loại nguyên liệu (Ingredient Category) với phân trang và lọc
 * @param {Object} params - Tham số truy vấn
 * @param {number} [params.page=1] - Trang hiện tại
 * @param {number} [params.limit=10] - Số lượng mỗi trang
 * @param {string} [params.name] - Lọc theo tên loại nguyên liệu
 * @returns {Promise<Object>} - Danh sách loại nguyên liệu và thông tin phân trang
 */
export const fetchIngredientCategories = async (params) => {
  const data = await apiClient.get('/ingredient-categories', { params });

  // ✅ Chuẩn hóa dữ liệu trả về
  if (Array.isArray(data)) return { results: data };
  if (data.results) return data;
  if (data.data) return { results: data.data };

  return { results: [] };
};

/**
 * Lấy chi tiết loại nguyên liệu theo ID
 * @param {string} categoryId - ID loại nguyên liệu
 * @returns {Promise<Object>} - Thông tin chi tiết loại nguyên liệu
 */
export const fetchIngredientCategoryById = async (categoryId) => {
  const data = await apiClient.get(`/ingredient-categories/${categoryId}`);
  return data;
};

/**
 * Tạo loại nguyên liệu mới
 * @param {Object} categoryData - Dữ liệu loại nguyên liệu
 * @param {string} categoryData.name - Tên loại nguyên liệu
 * @param {string} [categoryData.description] - Mô tả
 * @param {string} [categoryData.status] - Trạng thái ("Hoạt động" hoặc "Ngừng hoạt động")
 * @returns {Promise<Object>} - Loại nguyên liệu vừa tạo
 */
export const createIngredientCategory = async (categoryData) => {
  const data = await apiClient.post('/ingredient-categories', categoryData);
  return data;
};

/**
 * Cập nhật thông tin loại nguyên liệu
 * @param {string} categoryId - ID loại nguyên liệu
 * @param {Object} updateData - Dữ liệu cập nhật
 * @param {string} [updateData.name] - Tên loại nguyên liệu
 * @param {string} [updateData.description] - Mô tả
 * @param {string} [updateData.status] - Trạng thái
 * @returns {Promise<Object>} - Thông tin sau khi cập nhật
 */
export const updateIngredientCategory = async (categoryId, updateData) => {
  const data = await apiClient.patch(
    `/ingredient-categories/${categoryId}`,
    updateData
  );
  return data;
};

/**
 * Xóa loại nguyên liệu theo ID
 * @param {string} categoryId - ID loại nguyên liệu
 * @returns {Promise<{message: string}>} - Kết quả xóa
 */
export const deleteIngredientCategory = async (categoryId) => {
  const data = await apiClient.delete(`/ingredient-categories/${categoryId}`);
  return data;
};

/**
 * Lấy danh sách tên các loại nguyên liệu (chỉ trường name)
 * @returns {Promise<Array<{ name: string }>>} - Danh sách tên loại nguyên liệu
 */
export const fetchIngredientCategoryNames = async () => {
  const data = await apiClient.get('/ingredient-categories/names');
  return Array.isArray(data) ? data : [];
};
