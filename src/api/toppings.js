//import apiClient from './client';

// Mock data cho topping
const MOCK_TOPPINGS = [
  {
    id: 1,
    name: "Trân châu đen",
    description: "Trân châu đen mềm dai, thơm ngon",
    price: 5000,
    currentStock: 50,
    minStock: 10,
    unit: "phần",
    status: "active",
    image:
      "https://images.pexels.com/photos/11758733/pexels-photo-11758733.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: 2,
    name: "Trân châu trắng",
    description: "Trân châu trắng trong suốt, ngọt dịu",
    price: 5000,
    currentStock: 30,
    minStock: 10,
    unit: "phần",
    status: "active",
    image:
      "https://images.pexels.com/photos/11758733/pexels-photo-11758733.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: 3,
    name: "Thạch dừa",
    description: "Thạch dừa tươi mát, giòn ngon",
    price: 7000,
    currentStock: 25,
    minStock: 5,
    unit: "phần",
    status: "active",
    image:
      "https://images.pexels.com/photos/11758733/pexels-photo-11758733.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: 4,
    name: "Pudding",
    description: "Pudding mềm mịn, vị vanilla",
    price: 8000,
    currentStock: 15,
    minStock: 8,
    unit: "phần",
    status: "active",
    image:
      "https://images.pexels.com/photos/11758733/pexels-photo-11758733.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: 5,
    name: "Aloe vera",
    description: "Nha đam thanh mát, bổ dưỡng",
    price: 6000,
    currentStock: 5,
    minStock: 10,
    unit: "phần",
    status: "low_stock",
    image:
      "https://images.pexels.com/photos/11758733/pexels-photo-11758733.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
];

let mockToppings = [...MOCK_TOPPINGS];

// Lấy danh sách topping
export const getToppings = async (params = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const { page = 1, limit = 10, search, status } = params;

  let filteredToppings = [...mockToppings];

  // Cập nhật trạng thái dựa trên tồn kho
  filteredToppings = filteredToppings.map((topping) => ({
    ...topping,
    status:
      topping.currentStock <= 0
        ? "out_of_stock"
        : topping.currentStock <= topping.minStock
        ? "low_stock"
        : "active",
  }));

  // Tìm kiếm theo tên
  if (search) {
    filteredToppings = filteredToppings.filter(
      (topping) =>
        topping.name.toLowerCase().includes(search.toLowerCase()) ||
        topping.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Lọc theo trạng thái
  if (status) {
    filteredToppings = filteredToppings.filter(
      (topping) => topping.status === status
    );
  }

  const total = filteredToppings.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const toppings = filteredToppings.slice(startIndex, endIndex);

  return {
    data: toppings,
    pagination: {
      current: page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy chi tiết topping
export const getTopping = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const topping = mockToppings.find((t) => t.id === parseInt(id));
  if (!topping) {
    throw new Error("Không tìm thấy topping");
  }

  return topping;
};

// Tạo topping mới
export const createTopping = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newTopping = {
    id: Math.max(...mockToppings.map((t) => t.id)) + 1,
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

  mockToppings.push(newTopping);
  return newTopping;
};

// Cập nhật topping
export const updateTopping = async (id, data) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = mockToppings.findIndex((t) => t.id === parseInt(id));
  if (index === -1) {
    throw new Error("Không tìm thấy topping");
  }

  const updatedTopping = {
    ...mockToppings[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  // Cập nhật trạng thái dựa trên tồn kho
  updatedTopping.status =
    updatedTopping.currentStock <= 0
      ? "out_of_stock"
      : updatedTopping.currentStock <= updatedTopping.minStock
      ? "low_stock"
      : "active";

  mockToppings[index] = updatedTopping;
  return updatedTopping;
};

// Xóa topping
export const deleteTopping = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const index = mockToppings.findIndex((t) => t.id === parseInt(id));
  if (index === -1) {
    throw new Error("Không tìm thấy topping");
  }

  mockToppings.splice(index, 1);
  return { success: true };
};

// Cập nhật tồn kho topping
export const updateToppingStock = async (id, quantity, type) => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const index = mockToppings.findIndex((t) => t.id === parseInt(id));
  if (index === -1) {
    throw new Error("Không tìm thấy topping");
  }

  const currentStock = mockToppings[index].currentStock;
  let newStock = currentStock;

  if (type === "import") {
    newStock = currentStock + quantity;
  } else if (type === "export") {
    newStock = Math.max(0, currentStock - quantity);
  } else if (type === "adjust") {
    newStock = quantity;
  }

  return updateTopping(id, { currentStock: newStock });
};
