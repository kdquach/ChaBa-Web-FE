import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, DatePicker, message, Modal, Card } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getOrders, updateOrderStatus } from '../../api/orders';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const OrderListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
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
      
      const response = await getOrders(queryParams);
      setOrders(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        current: response.pagination.current,
      }));
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng');
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

  // Xử lý lọc theo ngày
  const handleDateFilter = (dates) => {
    const newFilters = {
      ...filters,
      startDate: dates?.[0]?.format('YYYY-MM-DD') || '',
      endDate: dates?.[1]?.format('YYYY-MM-DD') || '',
    };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    loadData({ ...newFilters, page: 1 });
  };

  // Cập nhật trạng thái đơn hàng
  const handleStatusUpdate = (record, newStatus) => {
    const statusText = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý', 
      completed: 'Hoàn thành',
      cancelled: 'Hủy'
    };

    confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn chuyển đơn hàng "${record.orderNumber}" sang trạng thái "${statusText[newStatus]}"?`,
      onOk: async () => {
        try {
          await updateOrderStatus(record.id, newStatus);
          message.success('Cập nhật trạng thái thành công');
          loadData();
        } catch (error) {
          message.error(error.message || 'Không thể cập nhật trạng thái');
        }
      },
    });
  };

  // Cấu hình cột table
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      fixed: 'left',
      width: 120,
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/orders/${record.id}`)}
          style={{ padding: 0, height: 'auto' }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.customerPhone}</div>
        </div>
      ),
    },
    {
      title: 'Số lượng món',
      key: 'itemCount',
      width: 100,
      render: (_, record) => record.items?.length || 0,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      sorter: true,
      render: (total) => (
        <span style={{ fontWeight: 500 }}>
          {total.toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status, record) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'Chờ xử lý' },
          processing: { color: 'blue', text: 'Đang xử lý' },
          completed: { color: 'green', text: 'Hoàn thành' },
          cancelled: { color: 'red', text: 'Đã hủy' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        
        return (
          <Select
            value={status}
            size="small"
            style={{ width: '100%' }}
            onChange={(value) => handleStatusUpdate(record, value)}
          >
            <Option value="pending">
              <Tag color="orange">Chờ xử lý</Tag>
            </Option>
            <Option value="processing">
              <Tag color="blue">Đang xử lý</Tag>
            </Option>
            <Option value="completed">
              <Tag color="green">Hoàn thành</Tag>
            </Option>
            <Option value="cancelled">
              <Tag color="red">Đã hủy</Tag>
            </Option>
          </Select>
        );
      },
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 120,
      render: (status) => {
        const config = {
          pending: { color: 'orange', text: 'Chưa thanh toán' },
          paid: { color: 'green', text: 'Đã thanh toán' },
          failed: { color: 'red', text: 'Thất bại' }
        };
        const statusConfig = config[status] || config.pending;
        return <Tag color={statusConfig.color}>{statusConfig.text}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      sorter: true,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/orders/${record.id}`)}
            title="Xem chi tiết"
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/orders/${record.id}/edit`)}
            title="Chỉnh sửa"
          />
        </Space>
      ),
    },
  ];

  const headerExtra = (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate('/orders/new')}
    >
      Tạo đơn hàng
    </Button>
  );

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader 
        title="Quản lý đơn hàng" 
        subtitle="Danh sách tất cả đơn hàng trong hệ thống"
        extra={headerExtra}
      />

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm theo mã đơn hàng, tên khách hàng, SĐT..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          
          <Select
            placeholder="Trạng thái đơn hàng"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilter('status', value)}
            value={filters.status}
          >
            <Option value="pending">Chờ xử lý</Option>
            <Option value="processing">Đang xử lý</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
          
          <Select
            placeholder="Trạng thái thanh toán"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilter('paymentStatus', value)}
            value={filters.paymentStatus}
          >
            <Option value="pending">Chưa thanh toán</Option>
            <Option value="paid">Đã thanh toán</Option>
            <Option value="failed">Thất bại</Option>
          </Select>

          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            format="DD/MM/YYYY"
            onChange={handleDateFilter}
          />
        </Space>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default OrderListPage;