import React, { useEffect, useState } from "react";
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
  const [sortState, setSortState] = useState({ field: undefined, order: undefined });

  const loadData = async (
    page = pagination.current,
    limit = pagination.pageSize,
    keyword = search,
    sort = sortState
  ) => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (keyword && keyword.trim()) params.name = keyword.trim();
      if (sort?.field && sort?.order) {
        params.sortBy = `${sort.field}:${sort.order === "ascend" ? "asc" : "desc"}`;
      }
      const res = await getCategories(params);
      const list = res?.results || [];
      const total = res?.totalResults ?? res?.total ?? list.length ?? 0;
      setCategoriesRaw(Array.isArray(list) ? list : []);
      setPagination((p) => ({ ...p, current: res?.page ?? page, pageSize: res?.limit ?? limit, total }));
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(pagination.current, pagination.pageSize, search, sortState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, search, sortState.field, sortState.order]);

  const handleTableChange = (newPagination, _filters, sorter) => {
    setPagination((p) => ({ ...p, current: newPagination.current, pageSize: newPagination.pageSize }));
    // Normalize sorter and only allow sorting on specific fields
    const s = Array.isArray(sorter) ? sorter[0] || {} : sorter || {};
    const allowed = new Set(["name"]);
    if (allowed.has(s.field)) {
      setSortState({ field: s.field, order: s.order });
    } else {
      setSortState({ field: undefined, order: undefined });
    }
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
          message.success("Đã xóa danh mục thành công");
          loadData();
        } catch (err) {
          message.error(err?.message || "Không thể xóa danh mục");
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
      sorter: true,
      sortOrder: sortState.field === "name" ? sortState.order : null,
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
            onSearch={(value) => setSearch(value)}
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={categoriesRaw}
          rowKey={(r) => r.id || r._id}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default CategoryListPage;
