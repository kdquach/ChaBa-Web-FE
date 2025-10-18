import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, message, Modal, Card } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  fetchIngredientCategories,
  deleteIngredientCategory,
} from '../../api/ingredientCategories';

const { Search } = Input;
const { confirm } = Modal;

const IngredientCategoryListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 🔹 Load danh sách loại nguyên liệu
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchIngredientCategories();
      setAllCategories(response.results || []);
      handleFilterAndPagination(response.results || []);
    } catch (error) {
      message.error('Không thể tải danh sách loại nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Lọc và phân trang
  const handleFilterAndPagination = (data = allCategories) => {
    let filteredData = [...data];
    if (filters.search) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    setCategories(filteredData.slice(start, end));
    setPagination((prev) => ({ ...prev, total: filteredData.length }));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (allCategories.length > 0) handleFilterAndPagination();
  }, [filters, pagination.current, pagination.pageSize]);

  // 🔹 Xử lý tìm kiếm
  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // 🔹 Xử lý thay đổi bảng
  const handleTableChange = (newPagination, _, sorter) => {
    setPagination(newPagination);
    if (sorter && sorter.field) {
      const sortedData = [...allCategories].sort((a, b) => {
        let valA = a[sorter.field];
        let valB = b[sorter.field];
        if (typeof valA === 'string')
          return sorter.order === 'ascend'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        return 0;
      });
      handleFilterAndPagination(sortedData);
    }
  };

  // 🔹 Xóa loại nguyên liệu
  const handleDelete = (record) => {
    confirm({
      title: 'Xác nhận xóa loại nguyên liệu',
      content: `Bạn có chắc chắn muốn xóa "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteIngredientCategory(record.id);
          message.success('Xóa thành công');
          loadData();
        } catch (error) {
          message.error('Không thể xóa loại nguyên liệu');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên loại nguyên liệu',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <span style={{ color: '#999' }}>Không có</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {/* <Button
            type="text"
            size="small"
            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
            onClick={() => navigate(`/ingredient-categories/${record.id}/view`)}
          /> */}
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: '#faad14' }} />}
            onClick={() => navigate(`/ingredient-categories/${record.id}/edit`)}
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
      onClick={() => navigate('/ingredient-categories/new')}
    >
      Thêm loại nguyên liệu
    </Button>
  );

  if (loading && categories.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Quản lý loại nguyên liệu"
        subtitle="Danh sách tất cả loại nguyên liệu trong hệ thống"
        extra={headerExtra}
      />

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm kiếm loại nguyên liệu..."
            allowClear
            size="middle"
            style={{ width: 300 }}
            onChange={(e) => handleSearch(e.target.value)}
            value={filters.search}
            enterButton={<SearchOutlined />}
          />
        </Space>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};

export default IngredientCategoryListPage;
