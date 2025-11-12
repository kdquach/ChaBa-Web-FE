import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Image,
  Input,
  Select,
  message,
  Modal,
  Card,
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
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  fetchIngredients,
} from "../../api/products";

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const ProductListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    category: null,
    status: null,
  });

  const [allProducts, setAllProducts] = useState([]); // Thêm state mới để lưu toàn bộ sản phẩm

  // Load dữ liệu
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchProducts();
      setAllProducts(response.results); // Lưu toàn bộ dữ liệu
      handleFilterAndPagination(response.results); // Xử lý filter và phân trang
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await fetchCategories();
      if (response?.results) {
        setCategories(response.results);
      } else {
        console.error("Invalid categories response format:", response);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    }
  };

  const loadIngredients = async () => {
    try {
      const response = await fetchIngredients();
      if (response?.results) {
        setIngredients(response.results);
      } else {
        setIngredients([]);
      }
    } catch (error) {
      console.error("Error loading ingredients:", error);
      setIngredients([]);
    }
  };

  // Thêm hàm xử lý filter và phân trang
  const handleFilterAndPagination = (data = allProducts) => {
    let filteredData = [...data];

    // Xử lý tìm kiếm theo tên
    if (filters.search) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Xử lý lọc theo danh mục
    if (filters.category) {
      filteredData = filteredData.filter(
        (item) => item.categoryId === filters.category
      );
    }

    // Xử lý lọc theo trạng thái
    if (filters.status) {
      filteredData = filteredData.filter(
        (item) => item.status === filters.status
      );
    }

    // Tính toán phân trang
    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;

    // Cập nhật state
    setProducts(filteredData.slice(start, end));
    setPagination((prev) => ({
      ...prev,
      total: filteredData.length,
    }));
  };

  useEffect(() => {
    loadData();
    loadCategories();
    loadIngredients();
  }, []);

  // Thêm useEffect để xử lý filter khi filters thay đổi
  useEffect(() => {
    if (allProducts.length > 0) {
      handleFilterAndPagination();
    }
  }, [filters, pagination.current, pagination.pageSize]);

  // Xử lý thay đổi pagination + sort
  const handleTableChange = (newPagination, _, sorter) => {
    setPagination(newPagination);

    let sortedData = [...allProducts];

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
    handleFilterAndPagination();
  };

  // Xử lý lọc
  const handleFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current: 1 }));
    handleFilterAndPagination();
  };

  // Xử lý xóa sản phẩm
  const handleDelete = (record) => {
    confirm({
      title: "Xác nhận xóa sản phẩm",
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${record.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteProduct(record.id);
          message.success("Xóa sản phẩm thành công");
          loadData();
        } catch (error) {
          message.error(error.message || "Không thể xóa sản phẩm");
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
          alt="product"
          style={{ objectFit: "cover", borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Danh mục",
      dataIndex: "categoryId",
      key: "category",
      render: (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return <Tag color="blue">{category ? category.name : "N/A"}</Tag>;
      },
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      sorter: true,
      render: (price) => `${price.toLocaleString()} ₫`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Đang bán" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Công thức",
      dataIndex: "recipe",
      key: "recipe",
      render: (recipe) => (
        <Space direction="vertical">
          {recipe && recipe.length > 0 ? (
            <Tag color="purple">{recipe.length} Ingredients</Tag>
          ) : (
            <span style={{ color: "#999" }}>Không có</span>
          )}
        </Space>
      ),
    },
    {
      title: "Toppings",
      dataIndex: "toppings",
      key: "toppings",
      render: (toppings) => (
        <Space direction="vertical">
          {toppings && toppings.length > 0 ? (
            <Tag color="orange">{toppings.length} Topping</Tag>
          ) : (
            <span style={{ color: "#999" }}>Không có</span>
          )}
        </Space>
      ),
    },
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
            onClick={() => navigate(`/products/${record.id}/view`)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${record.id}/edit`)}
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
      onClick={() => navigate("/products/new")}
    >
      Thêm sản phẩm
    </Button>
  );

  if (loading && products.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Quản lý sản phẩm"
        subtitle="Danh sách tất cả sản phẩm trong hệ thống"
        extra={headerExtra}
      />

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            size="middle"
            style={{ width: 300 }}
            onChange={(e) => handleSearch(e.target.value)}
            value={filters.search}
          />

          <Select
            placeholder="Chọn danh mục"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilter("category", value)}
            value={filters.category}
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilter("status", value)}
            value={filters.status}
          >
            <Option value="Đang bán">Đang bán</Option>
            <Option value="Ngừng bán">Ngừng bán</Option>
          </Select>
        </Space>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Table
          columns={columns}
          dataSource={products}
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

export default ProductListPage;
