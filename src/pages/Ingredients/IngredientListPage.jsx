import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, message, Modal, Card, Progress, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getIngredients, deleteIngredient } from '../../api/ingredients';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const IngredientListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    lowStock: false,
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
      
      const response = await getIngredients(queryParams);
      setIngredients(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        current: response.pagination.current,
      }));
    } catch (error) {
      message.error('Không thể tải danh sách nguyên liệu');
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

  // Xử lý xóa nguyên liệu
  const handleDelete = (record) => {
    confirm({
      title: 'Xác nhận xóa nguyên liệu',
      content: `Bạn có chắc chắn muốn xóa nguyên liệu "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteIngredient(record.id);
          message.success('Xóa nguyên liệu thành công');
          loadData();
        } catch (error) {
          message.error(error.message || 'Không thể xóa nguyên liệu');
        }
      },
    });
  };

  // Cấu hình cột table
  const columns = [
    {
      title: 'Tên nguyên liệu',
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
      title: 'Tồn kho',
      key: 'stock',
      sorter: true,
      render: (_, record) => {
        const { currentStock, minStock, maxStock } = record;
        const percentage = Math.round((currentStock / maxStock) * 100);
        const status = currentStock <= 0 ? 'exception' : 
                      currentStock <= minStock ? 'normal' : 'success';
        
        return (
          <div style={{ width: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>{currentStock}/{maxStock} {record.unit}</span>
            </div>
            <Progress 
              percent={percentage} 
              size="small" 
              status={status}
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'Đơn giá',
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      sorter: true,
      render: (price, record) => `${price.toLocaleString()} ₫/${record.unit}`,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier) => (
        <div style={{ fontSize: 13 }}>{supplier}</div>
      ),
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      sorter: true,
      render: (date) => {
        const expiryDate = dayjs(date);
        const isExpiringSoon = expiryDate.diff(dayjs(), 'days') <= 30;
        
        return (
          <div style={{ 
            color: isExpiringSoon ? '#ff4d4f' : undefined 
          }}>
            {expiryDate.format('DD/MM/YYYY')}
            {isExpiringSoon && (
              <div style={{ fontSize: 11, color: '#ff4d4f' }}>
                Sắp hết hạn
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          active: { color: 'green', text: 'Đủ hàng' },
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
            onClick={() => navigate(`/ingredients/${record.id}/edit`)}
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

  // Đếm số nguyên liệu cảnh báo
  const lowStockCount = ingredients.filter(item => 
    item.currentStock <= item.minStock
  ).length;

  const headerExtra = (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate('/ingredients/new')}
    >
      Thêm nguyên liệu
    </Button>
  );

  if (loading && ingredients.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader 
        title="Quản lý nguyên liệu" 
        subtitle="Theo dõi tồn kho và quản lý nguyên liệu"
        extra={headerExtra}
      />

      {/* Cảnh báo tồn kho */}
      {lowStockCount > 0 && (
        <Alert
          message={`Cảnh báo tồn kho`}
          description={`Có ${lowStockCount} nguyên liệu sắp hết hoặc đã hết hàng. Vui lòng bổ sung kịp thời.`}
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          style={{ marginBottom: 16 }}
          action={
            <Button
              size="small"
              type="link"
              onClick={() => handleFilter('lowStock', true)}
            >
              Xem chi tiết
            </Button>
          }
        />
      )}

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm kiếm nguyên liệu..."
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
            <Option value="active">Đủ hàng</Option>
            <Option value="low_stock">Sắp hết</Option>
            <Option value="out_of_stock">Hết hàng</Option>
          </Select>

          <Button
            type={filters.lowStock ? 'primary' : 'default'}
            onClick={() => handleFilter('lowStock', !filters.lowStock)}
          >
            Chỉ hiện sắp hết hàng
          </Button>
        </Space>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Table
          columns={columns}
          dataSource={ingredients}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default IngredientListPage;