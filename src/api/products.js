//import apiClient from './client';

// Mock data cho sản phẩm trà sữa
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Trà Sữa Truyền Thống",
    description: "Trà sữa đậm đà với hương vị truyền thống",
    price: 25000,
    category: "Trà Sữa",
    image:
      "https://images.pexels.com/photos/2346080/pexels-photo-2346080.jpeg?auto=compress&cs=tinysrgb&w=400",
    status: "active",
    ingredients: ["Trà đen", "Sữa tươi", "Đường"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Trà Sữa Matcha",
    description: "Trà sữa matcha Nhật Bản thơm ngon",
    price: 35000,
    category: "Trà Sữa",
    image:
      "https://images.pexels.com/photos/1793037/pexels-photo-1793037.jpeg?auto=compress&cs=tinysrgb&w=400",
    status: "active",
    ingredients: ["Bột matcha", "Sữa tươi", "Đường"],
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
  },
  {
    id: 3,
    name: "Trà Sữa Chocolate",
    description: "Trà sữa vị chocolate đậm đà",
    price: 30000,
    category: "Trà Sữa",
    image:
      "https://images.pexels.com/photos/6692892/pexels-photo-6692892.jpeg?auto=compress&cs=tinysrgb&w=400",
    status: "active",
    ingredients: ["Trà đen", "Sữa tươi", "Chocolate", "Đường"],
    createdAt: "2024-01-15T11:30:00Z",
    updatedAt: "2024-01-15T11:30:00Z",
  },
  {
    id: 4,
    name: "Trà Oolong Sữa",
    description: "Trà oolong thơm ngon với sữa tươi",
    price: 28000,
    category: "Trà Oolong",
    image:
      "https://images.pexels.com/photos/2346080/pexels-photo-2346080.jpeg?auto=compress&cs=tinysrgb&w=400",
    status: "inactive",
    ingredients: ["Trà oolong", "Sữa tươi", "Đường"],
    createdAt: "2024-01-15T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
];

let mockProducts = [...MOCK_PRODUCTS];

// Lấy danh sách sản phẩm
export const getProducts = async (params = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { page = 1, limit = 10, search, category, status } = params;

  let filteredProducts = [...mockProducts];

  // Tìm kiếm theo tên
  if (search) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Lọc theo danh mục
  if (category) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === category
    );
  }

  // Lọc theo trạng thái
  if (status) {
    filteredProducts = filteredProducts.filter(
      (product) => product.status === status
    );
  }

  const total = filteredProducts.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const products = filteredProducts.slice(startIndex, endIndex);

  return {
    data: products,
    pagination: {
      current: page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy chi tiết sản phẩm
export const getProduct = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const product = mockProducts.find((p) => p.id === parseInt(id));
  if (!product) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  return product;
};

// Tạo sản phẩm mới
export const createProduct = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newProduct = {
    id: Math.max(...mockProducts.map((p) => p.id)) + 1,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockProducts.push(newProduct);
  return newProduct;
};

// Cập nhật sản phẩm
export const updateProduct = async (id, data) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = mockProducts.findIndex((p) => p.id === parseInt(id));
  if (index === -1) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  mockProducts[index] = {
    ...mockProducts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return mockProducts[index];
};

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const index = mockProducts.findIndex((p) => p.id === parseInt(id));
  if (index === -1) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  mockProducts.splice(index, 1);
  return { success: true };
};

// Lấy danh mục sản phẩm
export const getCategories = async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const categories = [...new Set(mockProducts.map((p) => p.category))];
  return categories;
};
