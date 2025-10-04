import apiClient from "./client";

/**
 * Lấy danh sách sản phẩm với phân trang và lọc
 * @param {Object} params - Tham số truy vấn
 * @param {number} [params.page=1] - Trang hiện tại
 * @param {number} [params.limit=10] - Số sản phẩm trên mỗi trang
 * @param {string} [params.category] - Lọc theo danh mục
 * @param {string} [params.search] - Từ khóa tìm kiếm
 * @returns {Promise<Object>} - Danh sách sản phẩm và thông tin phân trang
 */
export const fetchProducts = async (params) => {
  const data = await apiClient.get("/products", { params });
  return data;
};

/**
 * Lấy chi tiết sản phẩm theo ID
 * @param {string} productId - ID sản phẩm
 * @returns {Promise<Object>} - Thông tin chi tiết sản phẩm
 */
export const fetchProductById = async (productId) => {
  const { data } = await apiClient.get(`/products/${productId}`);
  return data;
};

/**
 * Tạo sản phẩm mới
 * @param {Object} productData - Dữ liệu sản phẩm
 * @param {string} productData.name - Tên sản phẩm
 * @param {string} productData.description - Mô tả sản phẩm
 * @param {number} productData.price - Giá sản phẩm
 * @param {string} productData.category - Danh mục sản phẩm
 * @param {string} [productData.image] - URL ảnh sản phẩm
 * @returns {Promise<Object>} - Thông tin sản phẩm đã tạo
 */
export const createProduct = async (productData) => {
  const { data } = await apiClient.post("/products", productData);
  return data;
};

/**
 * Cập nhật thông tin sản phẩm
 * @param {string} productId - ID sản phẩm
 * @param {Object} productData - Dữ liệu cập nhật
 * @param {string} [productData.name] - Tên sản phẩm
 * @param {string} [productData.description] - Mô tả sản phẩm
 * @param {number} [productData.price] - Giá sản phẩm
 * @param {string} [productData.category] - Danh mục sản phẩm
 * @param {string} [productData.image] - URL ảnh sản phẩm
 * @returns {Promise<Object>} - Thông tin sản phẩm đã cập nhật
 */
export const updateProduct = async (productId, productData) => {
  const { data } = await apiClient.put(`/products/${productId}`, productData);
  return data;
};

/**
 * Xóa sản phẩm theo ID
 * @param {string} productId - ID sản phẩm
 * @returns {Promise<{success: boolean}>} - Kết quả xóa sản phẩm
 */
export const deleteProduct = async (productId) => {
  const { data } = await apiClient.delete(`/products/${productId}`);
  return data;
};

/**
 * Lấy danh sách danh mục sản phẩm
 * @returns {Promise<Array<string>>} - Danh sách danh mục
 */
export const fetchCategories = async () => {
  const data = await apiClient.get("/categories");
  return data;
};

/**
 * Lấy danh sách nguyên liệu sản phẩm
 * @returns {Promise<Array<string>>} - Danh sách nguyên liệu
 */
export const fetchIngredients = async () => {
  const data = await apiClient.get("/ingredients");
  console.log("fetchIngredients data:", data); // 🔥 debug
  return data;
};
