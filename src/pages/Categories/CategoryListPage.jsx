import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Space, Input, Modal, Card, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getCategories, deleteCategory } from "../../api/categories";

const { Search } = Input;
const { confirm } = Modal;

const CategoryListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categoriesRaw, setCategoriesRaw] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      const list = res?.results || res?.data || res || [];
      setCategoriesRaw(Array.isArray(list) ? list : []);
      setPagination((p) => ({ ...p, total: Array.isArray(list) ? list.length : 0 }));
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return categoriesRaw;
    return categoriesRaw.filter(
      (c) => c.name?.toLowerCase().includes(keyword) || c.description?.toLowerCase().includes(keyword)
    );
  }, [categoriesRaw, search]);

  const paged = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filtered.slice(start, end);
  }, [filtered, pagination]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleDelete = (record) => {
    confirm({
      title: "Xác nhận xóa danh mục",
      content: `Bạn có chắc muốn xóa danh mục "${record.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteCategory(record.id || record._id);
          message.success("Đã xóa danh mục");
          loadData();
        } catch (err) {
        }
      },
    });
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      align: "center",
      render: (_text, _record, idx) => {
        const base = (pagination.current - 1) * pagination.pageSize;
        return base + idx + 1;
      },
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (text ? <span style={{ color: "#666" }}>{text}</span> : <Tag color="default">Không có</Tag>),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/categories/${record.id || record._id}/edit`)}
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
    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/categories/new")}>
      Thêm danh mục
    </Button>
  );

  if (loading && categoriesRaw.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader title="Quản lý danh mục" subtitle="Tạo và chỉnh sửa danh mục sản phẩm" extra={headerExtra} />

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm kiếm danh mục..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: 320 }}
            onSearch={setSearch}
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={paged}
          rowKey={(r) => r.id || r._id}
          loading={loading}
          pagination={{ ...pagination, total: filtered.length }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default CategoryListPage;
