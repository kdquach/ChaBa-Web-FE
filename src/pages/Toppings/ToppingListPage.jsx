import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Select,
  Image,
  Input,
  message,
  Modal,
  Card,
  Switch, // Thêm Switch cho isAvailable
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  getAllToppings, // Đã sửa API
  deleteTopping, // Đã sửa API
} from "../../api/toppings"; // Đã sửa API

const { Search } = Input;
const { confirm } = Modal;

const ToppingListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toppings, setToppings] = useState([]); // Đã đổi tên state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    isAvailable: null, // Chỉ cần isAvailable, không cần category/status
  });

  const [allToppings, setAllToppings] = useState([]); // Thêm state mới để lưu toàn bộ sản phẩm

  // Load dữ liệu
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getAllToppings(); // Gọi API Topping
      setAllToppings(response.results); // Lưu toàn bộ dữ liệu
      handleFilterAndPagination(response.results); // Xử lý filter và phân trang
    } catch (error) {
      message.error("Không thể tải danh sách toppings");
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xử lý filter và phân trang
  const handleFilterAndPagination = (data = allToppings) => {
    let filteredData = [...data];

    // Xử lý tìm kiếm theo tên
    if (filters.search) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Xử lý lọc theo trạng thái isAvailable (true/false)
    if (filters.isAvailable !== null) {
      filteredData = filteredData.filter(
        (item) => item.isAvailable === filters.isAvailable
      );
    }

    // Tính toán phân trang
    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;

    // Cập nhật state
    setToppings(filteredData.slice(start, end));
    setPagination((prev) => ({
      ...prev,
      total: filteredData.length,
    }));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Thêm useEffect để xử lý filter khi filters thay đổi
  useEffect(() => {
    if (allToppings.length > 0) {
      handleFilterAndPagination();
    }
  }, [filters, pagination.current, pagination.pageSize]);

  // Xử lý thay đổi pagination + sort
  const handleTableChange = (newPagination, _, sorter) => {
    setPagination(newPagination);

    let sortedData = [...allToppings];

    if (sorter && sorter.field) {
      sortedData.sort((a, b) => {
        let valueA = a[sorter.field];
        let valueB = b[sorter.field];

        // Nếu là string (ví dụ: name)
        if (typeof valueA === "string") {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
          return sorter.order === "ascend"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        // Nếu là số (ví dụ: price)
        if (typeof valueA === "number") {
          return sorter.order === "ascend" ? valueA - valueB : valueB - valueA;
        }

        // Nếu là boolean (isAvailable)
        if (typeof valueA === "boolean") {
          return sorter.order === "ascend"
            ? valueA === valueB
              ? 0
              : valueA
              ? -1
              : 1 // true trước false
            : valueA === valueB
            ? 0
            : valueA
            ? 1
            : -1; // false trước true
        }

        return 0;
      });
    }

    // Sau khi sort thì vẫn phải filter và phân trang
    handleFilterAndPagination(sortedData);
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Xử lý lọc
  const handleFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Xử lý xóa topping
  const handleDelete = (record) => {
    confirm({
      title: "Xác nhận xóa Topping",
      content: `Bạn có chắc chắn muốn xóa topping "${record.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteTopping(record.id); // Gọi API deleteTopping
          message.success("Xóa topping thành công");
          loadData();
        } catch (error) {
          message.error(error.message || "Không thể xóa topping");
        }
      },
    });
  };

  // Cấu hình cột table
  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (image) => (
        <Image
          width={60}
          height={60}
          src={image}
          alt="topping"
          style={{ objectFit: "cover", borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
        />
      ),
    },
    {
      title: "Tên Topping",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      sorter: true,
      render: (price) => `${price.toLocaleString()} ₫`,
    },
    {
      title: "Trạng thái", // Thay thế cho cột Danh mục
      dataIndex: "isAvailable",
      key: "isAvailable",
      sorter: true,
      render: (isAvailable) => (
        <Tag color={isAvailable ? "green" : "red"}>
          {isAvailable ? "Đang bán" : "Ngừng bán"}
        </Tag>
      ),
    },
    // Xóa cột Công thức (recipe)

    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/toppings/${record.id}/view`)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/toppings/${record.id}/edit`)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const headerExtra = (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate("/toppings/new")} // Sửa path
    >
      Thêm Topping
    </Button>
  );

  if (loading && toppings.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Quản lý Topping" // Sửa title
        subtitle="Danh sách tất cả toppings trong hệ thống" // Sửa subtitle
        extra={headerExtra}
      />

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm kiếm topping..." // Sửa placeholder
            allowClear
            size="middle"
            style={{ width: 300 }}
            onChange={(e) => handleSearch(e.target.value)}
            value={filters.search}
          />

          {/* SỬA LỖI: Bộ lọc isAvailable thay thế cho Danh mục */}
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilter("isAvailable", value)} // Sửa key filter
            value={filters.isAvailable}
          >
            <Option value={true}>Đang bán</Option>
            <Option value={false}>Ngừng bán</Option>
          </Select>
        </Space>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Table
          columns={columns}
          dataSource={toppings}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default ToppingListPage;
