//import apiClient from './client';

// Mock data cho nguyên liệu
const MOCK_INGREDIENTS = [
  {
    id: 1,
    name: "Trà đen",
    description: "Trà đen chất lượng cao từ Thái Nguyên",
    unit: "kg",
    currentStock: 25,
    minStock: 5,
    maxStock: 100,
    pricePerUnit: 200000,
    supplier: "Công ty Trà Thái Nguyên",
    expiryDate: "2024-12-31",
    status: "active",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: 2,
    name: "Sữa tươi",
    description: "Sữa tươi nguyên kem Dalat Milk",
    unit: "lít",
    currentStock: 50,
    minStock: 20,
    maxStock: 200,
    pricePerUnit: 15000,
    supplier: "Dalat Milk",
    expiryDate: "2024-02-15",
    status: "active",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: 3,
    name: "Bột matcha",
    description: "Bột matcha Nhật Bản nguyên chất",
    unit: "kg",
    currentStock: 3,
    minStock: 2,
    maxStock: 20,
    pricePerUnit: 1200000,
    supplier: "Nhập khẩu Nhật Bản",
    expiryDate: "2024-08-30",
    status: "low_stock",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: 4,
    name: "Đường",
    description: "Đường trắng tinh luyện",
    unit: "kg",
    currentStock: 40,
    minStock: 10,
    maxStock: 100,
    pricePerUnit: 25000,
    supplier: "Công ty Đường Biên Hòa",
    expiryDate: "2025-01-31",
    status: "active",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: 5,
    name: "Trân châu",
    description: "Trân châu đen cao cấp",
    unit: "kg",
    currentStock: 1,
    minStock: 3,
    maxStock: 30,
    pricePerUnit: 80000,
    supplier: "Công ty Trân Châu Việt",
    expiryDate: "2024-06-30",
    status: "out_of_stock",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
];

let mockIngredients = [...MOCK_INGREDIENTS];

// Lấy danh sách nguyên liệu
export const getIngredients = async (params = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { page = 1, limit = 10, search, status, lowStock } = params;

  let filteredIngredients = [...mockIngredients];

  // Cập nhật trạng thái dựa trên tồn kho
  filteredIngredients = filteredIngredients.map((ingredient) => ({
    ...ingredient,
    status:
      ingredient.currentStock <= 0
        ? "out_of_stock"
        : ingredient.currentStock <= ingredient.minStock
        ? "low_stock"
        : "active",
  }));

  // Tìm kiếm theo tên
  if (search) {
    filteredIngredients = filteredIngredients.filter(
      (ingredient) =>
        ingredient.name.toLowerCase().includes(search.toLowerCase()) ||
        ingredient.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Lọc theo trạng thái
  if (status) {
    filteredIngredients = filteredIngredients.filter(
      (ingredient) => ingredient.status === status
    );
  }

  // Lọc chỉ nguyên liệu sắp hết
  if (lowStock) {
    filteredIngredients = filteredIngredients.filter(
      (ingredient) => ingredient.currentStock <= ingredient.minStock
    );
  }

  const total = filteredIngredients.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const ingredients = filteredIngredients.slice(startIndex, endIndex);

  return {
    data: ingredients,
    pagination: {
      current: page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy chi tiết nguyên liệu
export const getIngredient = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const ingredient = mockIngredients.find((i) => i.id === parseInt(id));
  if (!ingredient) {
    throw new Error("Không tìm thấy nguyên liệu");
  }

  return ingredient;
};

// Tạo nguyên liệu mới
export const createIngredient = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newIngredient = {
    id: Math.max(...mockIngredients.map((i) => i.id)) + 1,
    ...data,
    status:
      data.currentStock <= 0
        ? "out_of_stock"
        : data.currentStock <= data.minStock
        ? "low_stock"
        : "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockIngredients.push(newIngredient);
  return newIngredient;
};

// Cập nhật nguyên liệu
export const updateIngredient = async (id, data) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = mockIngredients.findIndex((i) => i.id === parseInt(id));
  if (index === -1) {
    throw new Error("Không tìm thấy nguyên liệu");
  }

  const updatedIngredient = {
    ...mockIngredients[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  // Cập nhật trạng thái dựa trên tồn kho
  updatedIngredient.status =
    updatedIngredient.currentStock <= 0
      ? "out_of_stock"
      : updatedIngredient.currentStock <= updatedIngredient.minStock
      ? "low_stock"
      : "active";

  mockIngredients[index] = updatedIngredient;
  return updatedIngredient;
};

// Xóa nguyên liệu
export const deleteIngredient = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const index = mockIngredients.findIndex((i) => i.id === parseInt(id));
  if (index === -1) {
    throw new Error("Không tìm thấy nguyên liệu");
  }

  mockIngredients.splice(index, 1);
  return { success: true };
};

// Cập nhật tồn kho
export const updateStock = async (id, quantity, type) => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const index = mockIngredients.findIndex((i) => i.id === parseInt(id));
  if (index === -1) {
    throw new Error("Không tìm thấy nguyên liệu");
  }

  const currentStock = mockIngredients[index].currentStock;
  let newStock = currentStock;

  if (type === "import") {
    newStock = currentStock + quantity;
  } else if (type === "export") {
    newStock = Math.max(0, currentStock - quantity);
  } else if (type === "adjust") {
    newStock = quantity;
  }

  return updateIngredient(id, { currentStock: newStock });
};

// Lấy cảnh báo nguyên liệu
export const getStockAlerts = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const alerts = mockIngredients
    .filter((ingredient) => ingredient.currentStock <= ingredient.minStock)
    .map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      currentStock: ingredient.currentStock,
      minStock: ingredient.minStock,
      type: ingredient.currentStock <= 0 ? "out_of_stock" : "low_stock",
    }));

  return alerts;
};
