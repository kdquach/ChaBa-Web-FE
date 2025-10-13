import apiClient from './client';

/**
 * Lấy danh sách nguyên liệu (ingredient) với phân trang và lọc
 * @param {Object} params - Tham số truy vấn
 * @param {number} [params.page=1] - Trang hiện tại
 * @param {number} [params.limit=10] - Số nguyên liệu trên mỗi trang
 * @param {string} [params.name] - Lọc theo tên nguyên liệu
 * @param {string} [params.unit] - Lọc theo đơn vị
 * @param {string} [params.categoryId] - Lọc theo danh mục nguyên liệu
 * @returns {Promise<Object>} - Danh sách nguyên liệu và thông tin phân trang
 */

export const fetchIngredients = async (params) => {
  const data = await apiClient.get('/ingredients', { params });

  // ✅ Trả về mảng results hoặc data (tự động fallback)
  if (Array.isArray(data)) return { results: data };
  if (data.results) return data;
  if (data.data) return { results: data.data };

  return { results: [] };
};

/**
 * Lấy chi tiết nguyên liệu theo ID
 * @param {string} ingredientId - ID nguyên liệu
 * @returns {Promise<Object>} - Thông tin chi tiết nguyên liệu
 */
export const fetchIngredientById = async (ingredientId) => {
  const data = await apiClient.get(`/ingredients/${ingredientId}`);
  return data;
};

/**
 * Tạo nguyên liệu mới
 * @param {Object} ingredientData - Dữ liệu nguyên liệu
 * @param {string} ingredientData.name - Tên nguyên liệu
 * @param {string} ingredientData.unit - Đơn vị tính (vd: kg, g, lít)
 * @param {number} ingredientData.stock - Số lượng tồn kho
 * @param {string} ingredientData.categoryId - ID danh mục nguyên liệu
 * @returns {Promise<Object>} - Thông tin nguyên liệu đã tạo
 */
export const createIngredient = async (ingredientData) => {
  const data = await apiClient.post('/ingredients', ingredientData);
  return data;
};

/**
 * Cập nhật thông tin nguyên liệu
 * @param {string} ingredientId - ID nguyên liệu
 * @param {Object} updateData - Dữ liệu cập nhật
 * @param {string} [updateData.name] - Tên nguyên liệu
 * @param {string} [updateData.unit] - Đơn vị
 * @param {number} [updateData.stock] - Số lượng tồn
 * @param {string} [updateData.categoryId] - ID danh mục
 * @returns {Promise<Object>} - Thông tin nguyên liệu đã cập nhật
 */
export const updateIngredient = async (ingredientId, updateData) => {
  const data = await apiClient.patch(
    `/ingredients/${ingredientId}`,
    updateData
  );
  return data;
};

/**
 * Xóa nguyên liệu theo ID
 * @param {string} ingredientId - ID nguyên liệu
 * @returns {Promise<{message: string}>} - Kết quả xóa nguyên liệu
 */
export const deleteIngredient = async (ingredientId) => {
  const data = await apiClient.delete(`/ingredients/${ingredientId}`);
  return data;
};

/**
 * Lấy danh sách danh mục nguyên liệu
 * (nếu backend có route /ingredient-categories)
 * @returns {Promise<Array<Object>>} - Danh sách danh mục nguyên liệu
 */
export const fetchIngredientCategories = async () => {
  const data = await apiClient.get('/ingredient-categories');
  return data;
};
