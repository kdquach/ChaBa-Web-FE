import apiClient from './client';

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

// Chuẩn hóa user từ BE cho UI hiện tại (suy ra type/status nếu thiếu)
function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== "" && v != null)
  );
}


// Lấy danh sách users
export const fetchUsers = async (params) => {
  try {
    // Gọi API backend
    const res = await apiClient.get('/users', { params: cleanParams(params) });
    return res; // nếu backend trả mảng trực tiếp
  } catch (err) {
    const status = err?.response?.status;
    // Nếu chưa đăng nhập (401) hoặc không đủ quyền (403), fallback mock để UI vẫn chạy được trong dev
    if (status === 401 || status === 403) {
      return [...mockUsers];
    }
    throw err;
  }
};
export const getUsers = async (params = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { results, totalResults, totalPages, page, limit } = await fetchUsers(params);
  console.log("🚀 ~ getUsers ~ results:", results)


  return {
    data: results,
    pagination: {
      current: page,
      pageSize: limit,
      total: totalResults,
      totalPages: totalPages,
    },
  };
};

// Lấy chi tiết user
export const getUser = async (id) => {
  try {
    const res = await apiClient.get(`/users/${id}`);
    console.log("🚀 ~ getUser ~ res:", res)
    return res;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      // Fallback dev: tìm trong mock
      const user = mockUsers.find((u) => String(u.id) === String(id));
      if (!user) throw new Error("Không tìm thấy người dùng");
      return user;
    }
    throw err;
  }
};

// Tạo user mới
export const createUser = async (data) => {
  try {
    let { password, type } = data;
    if (!password && type) {
      password = `${type}12345`;
    }
    const res = await apiClient.post('/users', { ...data, password });
    return res;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      // Fallback dev
      const newUser = {
        id: Math.max(...mockUsers.map((u) => u.id)) + 1,
        ...data,
        status: data.status || 'active',
        permissions: data.permissions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      return newUser;
    }
    throw err;
  }
};

// Cập nhật user
export const updateUser = async (id, data) => {
  try {
    const res = await apiClient.patch(`/users/${id}`, data);
    return res;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      // Fallback dev
      const index = mockUsers.findIndex((u) => String(u.id) === String(id));
      if (index === -1) throw new Error("Không tìm thấy người dùng");
      mockUsers[index] = {
        ...mockUsers[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockUsers[index];
    }
    throw err;
  }
};

// Xóa user
export const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`/users/${id}`);
    return response;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      // Fallback dev
      const index = mockUsers.findIndex((u) => String(u.id) === String(id));
      if (index === -1) throw new Error("Không tìm thấy người dùng");
      if (mockUsers[index].role === 'admin') throw new Error("Không thể xóa tài khoản admin");
      mockUsers.splice(index, 1);
      return { success: true };
    }
    throw err;
  }
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
