//import apiClient from './client';

// Mock data cho đơn hàng
const MOCK_ORDERS = [
  {
    id: 1,
    orderNumber: "ORD001",
    customerId: 1,
    customerName: "Nguyễn Văn A",
    customerPhone: "0123456789",
    items: [
      {
        id: 1,
        productId: 1,
        productName: "Trà Sữa Truyền Thống",
        quantity: 2,
        price: 25000,
      },
      {
        id: 2,
        productId: 2,
        productName: "Trà Sữa Matcha",
        quantity: 1,
        price: 35000,
      },
    ],
    subtotal: 85000,
    discount: 5000,
    total: 80000,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "cash",
    notes: "Ít đá, ít ngọt",
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: 2,
    orderNumber: "ORD002",
    customerId: 2,
    customerName: "Trần Thị B",
    customerPhone: "0987654321",
    items: [
      {
        id: 3,
        productId: 3,
        productName: "Trà Sữa Chocolate",
        quantity: 1,
        price: 30000,
      },
    ],
    subtotal: 30000,
    discount: 0,
    total: 30000,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "card",
    notes: "",
    createdAt: "2024-01-20T15:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: 3,
    orderNumber: "ORD003",
    customerId: 3,
    customerName: "Lê Văn C",
    customerPhone: "0369852147",
    items: [
      {
        id: 4,
        productId: 1,
        productName: "Trà Sữa Truyền Thống",
        quantity: 3,
        price: 25000,
      },
      {
        id: 5,
        productId: 4,
        productName: "Trà Oolong Sữa",
        quantity: 1,
        price: 28000,
      },
    ],
    subtotal: 103000,
    discount: 10000,
    total: 93000,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "transfer",
    notes: "Giao tận nơi",
    createdAt: "2024-01-20T16:15:00Z",
    updatedAt: "2024-01-20T16:45:00Z",
  },
];

let mockOrders = [...MOCK_ORDERS];

// Lấy danh sách đơn hàng
export const getOrders = async (params = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const {
    page = 1,
    limit = 10,
    search,
    status,
    paymentStatus,
    startDate,
    endDate,
  } = params;

  let filteredOrders = [...mockOrders];

  // Tìm kiếm theo số đơn hàng hoặc tên khách hàng
  if (search) {
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.customerPhone.includes(search)
    );
  }

  // Lọc theo trạng thái đơn hàng
  if (status) {
    filteredOrders = filteredOrders.filter((order) => order.status === status);
  }

  // Lọc theo trạng thái thanh toán
  if (paymentStatus) {
    filteredOrders = filteredOrders.filter(
      (order) => order.paymentStatus === paymentStatus
    );
  }

  // Lọc theo ngày
  if (startDate || endDate) {
    filteredOrders = filteredOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : new Date("2000-01-01");
      const end = endDate ? new Date(endDate) : new Date("2099-12-31");
      return orderDate >= start && orderDate <= end;
    });
  }

  // Sắp xếp theo ngày tạo mới nhất
  filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = filteredOrders.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const orders = filteredOrders.slice(startIndex, endIndex);

  return {
    data: orders,
    pagination: {
      current: page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy chi tiết đơn hàng
export const getOrder = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const order = mockOrders.find((o) => o.id === parseInt(id));
  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  return order;
};

// Tạo đơn hàng mới
export const createOrder = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const newOrder = {
    id: Math.max(...mockOrders.map((o) => o.id)) + 1,
    orderNumber: `ORD${String(
      Math.max(...mockOrders.map((o) => o.id)) + 1
    ).padStart(3, "0")}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockOrders.push(newOrder);
  return newOrder;
};

// Cập nhật đơn hàng
export const updateOrder = async (id, data) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const index = mockOrders.findIndex((o) => o.id === parseInt(id));
  if (index === -1) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  mockOrders[index] = {
    ...mockOrders[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return mockOrders[index];
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (id, status) => {
  return updateOrder(id, { status });
};

// Thống kê đơn hàng
export const getOrderStats = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter((o) => o.status === "pending").length,
    processing: mockOrders.filter((o) => o.status === "processing").length,
    completed: mockOrders.filter((o) => o.status === "completed").length,
    cancelled: mockOrders.filter((o) => o.status === "cancelled").length,
    totalRevenue: mockOrders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.total, 0),
  };

  return stats;
};
