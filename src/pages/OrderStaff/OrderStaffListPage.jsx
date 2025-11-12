import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  message,
  Modal,
  Card,
} from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchOrders, updateOrderStatus } from '../../api/orderStaff';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const OrderStaffListPage = () => {
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
  });

  const buildQuery = (overrides = {}) => {
    const raw = {
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters,
      ...overrides,
    };

    const cleaned = {};
    Object.keys(raw).forEach((k) => {
      const v = raw[k];
      if (typeof v === 'string') {
        if (v.trim() !== '') cleaned[k] = v.trim();
      } else if (v !== undefined && v !== null) {
        cleaned[k] = v;
      }
    });

    return cleaned;
  };

  const loadOrders = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = buildQuery(params);
      const res = await fetchOrders(queryParams);
      setOrders(res.results || []);
      if (res.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: res.pagination.total || prev.total,
          current: res.pagination.current || prev.current,
        }));
      }
    } catch (err) {
      console.error(
        'Load orders error:',
        err.response?.data || err.message || err
      );
      message.error(
        'Không thể tải danh sách đơn hàng: ' +
          (err.response?.data?.message || err.message || 'Lỗi')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSearch = (value) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadOrders({ ...newFilters, page: 1 });
  };

  const handleFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadOrders({ ...newFilters, page: 1 });
  };

  const handleStatusUpdate = (record, newStatus) => {
    const orderCode = `#ORD${record.id.slice(-3).toUpperCase()}`;
    let note = '';

    Modal.confirm({
      title: `Cập nhật trạng thái đơn ${orderCode}`,
      content: (
        <div>
          <p>Bạn có muốn cập nhật trạng thái sang "{newStatus}"?</p>
          <Input.TextArea
            placeholder="Nhập ghi chú (tuỳ chọn)"
            rows={3}
            onChange={(e) => (note = e.target.value)}
          />
        </div>
      ),
      okText: 'Cập nhật',
      cancelText: 'Huỷ',
      onOk: async () => {
        try {
          await updateOrderStatus(record.id, { newStatus, note });
          message.success(`Đã cập nhật trạng thái đơn ${orderCode} thành công`);
          loadOrders();
        } catch (error) {
          message.error(`Không thể cập nhật trạng thái đơn ${orderCode}`);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: 120,
      render: (id) => {
        const shortId = id ? id.slice(-3).toUpperCase() : '---';
        return `#ORD${shortId}`;
      },
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      render: (user) => (
        <>
          <div>{user ? user.name : 'Khách lẻ'}</div>
          {user?.phone && (
            <div style={{ fontSize: 12, color: '#888' }}>{user.phone}</div>
          )}
        </>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'products',
      key: 'products',
      width: 160,
      render: (products) =>
        Array.isArray(products) && products.length > 0 ? (
          <div>
            {products.slice(0, 3).map((p, index) => (
              <div key={index} style={{ fontSize: 13 }}>
                • {p.name} ({p.quantity}×)
              </div>
            ))}
            {products.length > 3 && (
              <div style={{ fontSize: 12, color: '#999' }}>
                +{products.length - 3} món khác
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: '#aaa' }}>Không có</span>
        ),
    },
    {
      title: 'Số lượng',
      key: 'itemCount',
      width: 100,
      render: (_, record) => record.products?.length || 0,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      render: (value) => `${value?.toLocaleString()} ₫`,
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status, record) => {
        const statusMap = {
          pending: { color: 'orange', text: 'Chờ xác nhận' },
          confirmed: { color: 'blue', text: 'Đã xác nhận' },
          preparing: { color: 'gold', text: 'Đang chuẩn bị' },
          ready: { color: 'cyan', text: 'Sẵn sàng' },
          completed: { color: 'green', text: 'Hoàn thành' },
          cancelled: { color: 'red', text: 'Đã hủy' },
        };

        const isDisabled = status === 'completed' || status === 'cancelled';

        return (
          <Select
            value={status}
            size="small"
            style={{ width: '100%' }}
            onChange={(val) => handleStatusUpdate(record, val)}
            disabled={isDisabled}
          >
            {Object.entries(statusMap).map(([key, val]) => (
              <Option key={key} value={key}>
                <Tag color={val.color}>{val.text}</Tag>
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: 'Địa chỉ giao hàng',
      dataIndex: 'shippingAddress',
      key: 'shippingAddress',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'left',
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/order-staff/${record.id}/logs`)}
          style={{ padding: '0 4px' }}
          title={`Xem log đơn #ORD${record.id.slice(-3).toUpperCase()}`}
        />
      ),
    },
  ];

  if (loading && orders.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Quản lý đơn hàng (Nhân viên)"
        subtitle="Danh sách đơn hàng theo trạng thái và người phụ trách"
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => loadOrders()}>
            Làm mới
          </Button>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm địa chỉ giao hàng, tổng tiền..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Trạng thái đơn hàng"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => handleFilter('status', value)}
            value={filters.status || undefined}
          >
            <Option value="pending">Chờ xác nhận</Option>
            <Option value="confirmed">Đã xác nhận</Option>
            <Option value="preparing">Đang chuẩn bị</Option>
            <Option value="ready">Sẵn sàng</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={(p) => setPagination(p)}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default OrderStaffListPage;
