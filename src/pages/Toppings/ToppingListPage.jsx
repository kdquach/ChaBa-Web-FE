import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, message, Modal, Card, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getToppings, deleteTopping } from '../../api/toppings';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const ToppingListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toppings, setToppings] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  // Load dữ liệu
  const loadData = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        ...params,
      };
      
      const response = await getToppings(queryParams);
      setToppings(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        current: response.pagination.current,
      }));
    } catch (error) {
      message.error('Không thể tải danh sách topping');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Xử lý thay đổi pagination
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    loadData({
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    loadData({ ...newFilters, page: 1 });
  };

  // Xử lý lọc
  const handleFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    loadData({ ...newFilters, page: 1 });
  };

  // Xử lý xóa topping
  const handleDelete = (record) => {
    confirm({
      title: 'Xác nhận xóa topping',
      content: `Bạn có chắc chắn muốn xóa topping "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteTopping(record.id);
          message.success('Xóa topping thành công');
          loadData();
        } catch (error) {
          message.error(error.message || 'Không thể xóa topping');
        }
      },
    });
  };

  // Cấu hình cột table
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image, record) => (
        <Image
          width={60}
          height={60}
          src={image}
          alt={record.name}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
        />
      ),
    },
    {
      title: 'Tên topping',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      sorter: true,
      width: 120,
      render: (price) => (
        <span style={{ fontWeight: 500, color: '#52c41a' }}>
          +{price.toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {record.currentStock} {record.unit}
          </div>
          <div style={{ fontSize: 11, color: '#888' }}>
            Tối thiểu: {record.minStock} {record.unit}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          active: { color: 'green', text: 'Có sẵn' },
          low_stock: { color: 'orange', text: 'Sắp hết' },
          out_of_stock: { color: 'red', text: 'Hết hàng' }
        };
        const config = statusConfig[status] || statusConfig.active;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
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
      onClick={() => navigate('/toppings/new')}
    >
      Thêm topping
    </Button>
  );

  if (loading && toppings.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader 
        title="Quản lý topping" 
        subtitle="Danh sách các loại topping để thêm vào đồ uống"
        extra={headerExtra}
      />

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm kiếm topping..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilter('status', value)}
            value={filters.status}
          >
            <Option value="active">Có sẵn</Option>
            <Option value="low_stock">Sắp hết</Option>
            <Option value="out_of_stock">Hết hàng</Option>
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