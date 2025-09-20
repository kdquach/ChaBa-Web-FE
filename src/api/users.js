//import apiClient from './client';

// Mock data cho users (nhân viên và khách hàng)
const MOCK_USERS = [
  {
    id: 1,
    username: "admin",
    name: "Quản trị viên",
    email: "admin@bubbleteashop.com",
    phone: "0123456789",
    role: "admin",
    type: "staff",
    status: "active",
    permissions: [
      "manage_products",
      "manage_orders",
      "manage_users",
      "manage_ingredients",
      "manage_toppings",
      "view_reports",
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    username: "staff001",
    name: "Nhân viên A",
    email: "staff001@bubbleteashop.com",
    phone: "0987654321",
    role: "staff",
    type: "staff",
    status: "active",
    permissions: ["manage_products", "manage_orders"],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: 3,
    username: "customer001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0369852147",
    role: "customer",
    type: "customer",
    status: "active",
    permissions: [],
    address: "123 Đường ABC, Quận 1, TP.HCM",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: 4,
    username: "customer002",
    name: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0741852963",
    role: "customer",
    type: "customer",
    status: "active",
    permissions: [],
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    createdAt: "2024-01-16T00:00:00Z",
    updatedAt: "2024-01-16T00:00:00Z",
  },
];

let mockUsers = [...MOCK_USERS];

// Lấy danh sách users
export const getUsers = async (params = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { page = 1, limit = 10, search, type, role, status } = params;

  let filteredUsers = [...mockUsers];

  // Tìm kiếm theo tên, email, phone
  if (search) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.includes(search)
    );
  }

  // Lọc theo loại user (staff/customer)
  if (type) {
    filteredUsers = filteredUsers.filter((user) => user.type === type);
  }

  // Lọc theo role
  if (role) {
    filteredUsers = filteredUsers.filter((user) => user.role === role);
  }

  // Lọc theo trạng thái
  if (status) {
    filteredUsers = filteredUsers.filter((user) => user.status === status);
  }

  const total = filteredUsers.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const users = filteredUsers.slice(startIndex, endIndex);

  return {
    data: users,
    pagination: {
      current: page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy chi tiết user
export const getUser = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user = mockUsers.find((u) => u.id === parseInt(id));
  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  return user;
};

// Tạo user mới
export const createUser = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Kiểm tra username đã tồn tại
  const existingUser = mockUsers.find((u) => u.username === data.username);
  if (existingUser) {
    throw new Error("Tên đăng nhập đã tồn tại");
  }

  // Kiểm tra email đã tồn tại
  const existingEmail = mockUsers.find((u) => u.email === data.email);
  if (existingEmail) {
    throw new Error("Email đã tồn tại");
  }

  const newUser = {
    id: Math.max(...mockUsers.map((u) => u.id)) + 1,
    ...data,
    status: data.status || "active",
    permissions: data.permissions || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockUsers.push(newUser);
  return newUser;
};

// Cập nhật user
export const updateUser = async (id, data) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = mockUsers.findIndex((u) => u.id === parseInt(id));
  if (index === -1) {
    throw new Error("Không tìm thấy người dùng");
  }

  // Kiểm tra username và email trùng lặp (nếu có thay đổi)
  if (data.username && data.username !== mockUsers[index].username) {
    const existingUser = mockUsers.find((u) => u.username === data.username);
    if (existingUser) {
      throw new Error("Tên đăng nhập đã tồn tại");
    }
  }

  if (data.email && data.email !== mockUsers[index].email) {
    const existingEmail = mockUsers.find((u) => u.email === data.email);
    if (existingEmail) {
      throw new Error("Email đã tồn tại");
    }
  }

  mockUsers[index] = {
    ...mockUsers[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return mockUsers[index];
};

// Xóa user
export const deleteUser = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const index = mockUsers.findIndex((u) => u.id === parseInt(id));
  if (index === -1) {
    throw new Error("Không tìm thấy người dùng");
  }

  // Không cho phép xóa admin
  if (mockUsers[index].role === "admin") {
    throw new Error("Không thể xóa tài khoản admin");
  }

  mockUsers.splice(index, 1);
  return { success: true };
};

// Cập nhật trạng thái user
export const updateUserStatus = async (id, status) => {
  return updateUser(id, { status });
};

// Lấy thống kê users
export const getUserStats = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const stats = {
    total: mockUsers.length,
    staff: mockUsers.filter((u) => u.type === "staff").length,
    customer: mockUsers.filter((u) => u.type === "customer").length,
    active: mockUsers.filter((u) => u.status === "active").length,
    inactive: mockUsers.filter((u) => u.status === "inactive").length,
  };

  return stats;
};
