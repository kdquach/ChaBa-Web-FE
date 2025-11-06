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

// Tạo dữ liệu giả phong phú cho biểu đồ (doanh thu theo thời gian, top sản phẩm)
// Ghi chú: chỉ chạy 1 lần để tránh nhân đôi khi HMR
function seedMockOrders() {
  if (globalThis.__CHA_BA_MOCK_ORDERS_SEEDED__) return; // đã seed trong phiên này
  if (mockOrders.length > 100) {
    globalThis.__CHA_BA_MOCK_ORDERS_SEEDED__ = true;
    return; // đã có dữ liệu đủ lớn
  }

  const productCatalog = [
    { id: 1, name: "Trà Sữa Truyền Thống", price: 25000 },
    { id: 2, name: "Trà Sữa Matcha", price: 35000 },
    { id: 3, name: "Trà Sữa Chocolate", price: 30000 },
    { id: 4, name: "Trà Oolong Sữa", price: 28000 },
    { id: 5, name: "Hồng Trà Sữa", price: 27000 },
    { id: 6, name: "Trà Sữa Socola Bạc Hà", price: 32000 },
    { id: 7, name: "Trà Sữa Khoai Môn", price: 30000 },
    { id: 8, name: "Sữa Tươi Trân Châu Đường Đen", price: 35000 },
  ];

  // Helper tạo số giả lập theo ngày (deterministic-ish)
  const pseudoRand = (seed) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3); // 3 tháng gần đây
  startDate.setHours(0, 0, 0, 0);

  let nextId = Math.max(...mockOrders.map((o) => Number(o.id) || 0), 0) + 1;

  const days = 90; // 3 tháng ~ 90 ngày
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate.getTime());
    d.setDate(d.getDate() + i);
    const baseSeed = Number(`${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`);
    // 0-6 đơn/ngày
    const ordersInDay = Math.floor(pseudoRand(baseSeed) * 7);

    for (let k = 0; k < ordersInDay; k++) {
      const itemsCount = 1 + Math.floor(pseudoRand(baseSeed + k) * 3); // 1-3 món/đơn
      const items = [];
      let subtotal = 0;
      for (let t = 0; t < itemsCount; t++) {
        const pick = Math.floor(pseudoRand(baseSeed + k * 10 + t) * productCatalog.length);
        const qty = 1 + Math.floor(pseudoRand(baseSeed + k * 100 + t) * 3); // 1-3 ly
        const prod = productCatalog[pick];
        items.push({
          id: nextId * 10 + t,
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          price: prod.price,
        });
        subtotal += qty * prod.price;
      }
      const discount = subtotal > 100000 ? 5000 : 0;
      const total = subtotal - discount;
      const statusPool = ["completed", "completed", "processing", "pending"]; // ưu tiên completed
      const status = statusPool[Math.floor(pseudoRand(baseSeed + k * 7) * statusPool.length)];
      const paid = status === "completed" ? "paid" : "pending";

      mockOrders.push({
        id: nextId,
        orderNumber: `ORD${String(nextId).padStart(3, "0")}`,
        customerId: 1000 + nextId,
        customerName: `Khách ${nextId}`,
        customerPhone: `09${String(10000000 + nextId).slice(-8)}`,
        items,
        subtotal,
        discount,
        total,
        status,
        paymentStatus: paid,
        paymentMethod: paid === "paid" ? "card" : "cash",
        notes: "",
        createdAt: new Date(d.getTime() + k * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(d.getTime() + (k + 1) * 60 * 60 * 1000).toISOString(),
      });
      nextId++;
    }
  }
  globalThis.__CHA_BA_MOCK_ORDERS_SEEDED__ = true;
}

try { seedMockOrders(); } catch (e) { /* noop */ }

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

// Phân tích doanh thu theo khoảng thời gian và nhóm theo day|month|year
export const getRevenueAnalytics = async ({ from, to, groupBy = "day" } = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const start = from ? new Date(from) : new Date("2024-01-01T00:00:00Z");
  const end = to ? new Date(to) : new Date();

  const fmtKey = (d) => {
    const date = new Date(d);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    if (groupBy === "year") return `${y}`;
    if (groupBy === "month") return `${y}-${m}`;
    return `${y}-${m}-${day}`; // day
  };

  const filtered = mockOrders.filter((o) => {
    const created = new Date(o.createdAt);
    return created >= start && created <= end && o.status === "completed";
  });

  const map = new Map();
  for (const o of filtered) {
    const key = fmtKey(o.createdAt);
    const prev = map.get(key) || { revenue: 0, orders: 0 };
    map.set(key, { revenue: prev.revenue + (o.total || 0), orders: prev.orders + 1 });
  }

  // sort keys
  const keys = Array.from(map.keys()).sort((a, b) => (a > b ? 1 : -1));
  const buckets = keys.map((k) => ({ key: k, revenue: map.get(k).revenue, orders: map.get(k).orders }));

  const totalRevenue = buckets.reduce((s, b) => s + b.revenue, 0);
  const totalOrders = buckets.reduce((s, b) => s + b.orders, 0);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
    groupBy,
    totalRevenue,
    totalOrders,
    avgOrderValue: totalOrders ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
    buckets,
  };
};

// Top sản phẩm bán chạy theo số lượng trong khoảng thời gian
export const getTopProducts = async ({ from, to, limit = 10 } = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const start = from ? new Date(from) : new Date("2024-01-01T00:00:00Z");
  const end = to ? new Date(to) : new Date();

  const totals = new Map();
  for (const o of mockOrders) {
    const created = new Date(o.createdAt);
    if (!(created >= start && created <= end && o.status === "completed")) continue;
    for (const it of o.items || []) {
      const key = it.productName || `#${it.productId}`;
      const prev = totals.get(key) || { quantity: 0, revenue: 0 };
      const qty = Number(it.quantity || 0);
      const price = Number(it.price || 0);
      totals.set(key, { quantity: prev.quantity + qty, revenue: prev.revenue + qty * price });
    }
  }

  const rows = Array.from(totals.entries()).map(([name, agg]) => ({ name, ...agg }));
  rows.sort((a, b) => b.quantity - a.quantity);
  const top = rows.slice(0, limit);
  const totalQty = top.reduce((s, r) => s + r.quantity, 0) || 1;
  // Pie values as percentage, include revenue for tooltip/details
  return top.map((r) => ({ type: r.name, value: r.quantity, percent: r.quantity / totalQty, revenue: r.revenue }));
};
