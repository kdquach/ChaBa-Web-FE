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
  const data = await apiClient.get(`/products/${productId}`);
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
export const createProduct = async (data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("price", data.price);
  formData.append("categoryId", data.categoryId);
  formData.append("status", data.status);

  if (data.description) {
    formData.append("description", data.description);
  }

  if (data.image && data.image.originFileObj) {
    formData.append("image", data.image.originFileObj); // gửi file binary
  }

  // ✅ Gửi công thức có ingredientId + quantity
  if (Array.isArray(data.recipe)) {
    data.recipe.forEach((item, index) => {
      if (item.ingredientId)
        formData.append(`recipe[${index}][ingredientId]`, item.ingredientId);
      if (item.quantity != null)
        formData.append(`recipe[${index}][quantity]`, item.quantity);
    });
  }

  // ✅ Gửi topping
  if (Array.isArray(data.toppings)) {
    data.toppings.forEach((topping, index) => {
      formData.append(`toppings[${index}]`, topping);
    });
  }

  const res = await apiClient.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res;
};

/**
 * Cập nhật thông tin sản phẩm
 * @param {string} productId - ID sản phẩm
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} [data.name] - Tên sản phẩm
 * @param {number} [data.price] - Giá sản phẩm
 * @param {string} [data.categoryId] - ID danh mục sản phẩm
 * @param {string} [data.status] - Trạng thái sản phẩm
 * @param {string} [data.description] - Mô tả sản phẩm
 * @param {File} [data.image] - File ảnh sản phẩm
 * @returns {Promise<Object>} - Thông tin sản phẩm đã cập nhật
 */
export const updateProduct = async (productId, data) => {
  try {
    const formData = new FormData();

    // Append text fields if they exist
    if (data.name) formData.append("name", data.name);
    if (data.price) formData.append("price", data.price);
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    if (data.status) formData.append("status", data.status);

    if (data.description) {
      formData.append("description", data.description);
    }

    // Handle image update
    if (data.image && data.image.originFileObj) {
      formData.append("image", data.image.originFileObj);
    }

    // ✅ Gửi công thức có ingredientId + quantity
    if (Array.isArray(data.recipe)) {
      data.recipe.forEach((item, index) => {
        if (item.ingredientId)
          formData.append(`recipe[${index}][ingredientId]`, item.ingredientId);
        if (item.quantity != null)
          formData.append(`recipe[${index}][quantity]`, item.quantity);
      });
    }

    // ✅ Gửi topping
    if (Array.isArray(data.toppings)) {
      data.toppings.forEach((topping, index) => {
        formData.append(`toppings[${index}]`, topping);
      });
    }

    const response = await apiClient.patch(`/products/${productId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
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
  return data;
};
