import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, message, Modal, Card, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getUsers, deleteUser, updateUserStatus } from '../../api/users';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const UserListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    role: '',
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

      const response = await getUsers(queryParams);
      setUsers(response.data);
      console.log("🚀 ~ loadData ~ response.data:", response.data)
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        current: response.pagination.current,
      }));
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
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

  // Xử lý thay đổi trạng thái
  const handleStatusChange = (record, newStatus) => {
    confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} người dùng "${record.name}"?`,
      onOk: async () => {
        try {
          await updateUserStatus(record.id, newStatus);
          message.success('Cập nhật trạng thái thành công');
          loadData();
        } catch (error) {
          message.error(error.message || 'Không thể cập nhật trạng thái');
        }
      },
    });
  };

  // Xử lý xóa người dùng
  const handleDelete = (record) => {
    confirm({
      title: 'Xác nhận xóa người dùng',
      content: `Bạn có chắc chắn muốn xóa người dùng "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteUser(record.id);
          message.success('Xóa người dùng thành công');
          loadData();
        } catch (error) {
          message.error(error.message || 'Không thể xóa người dùng');
        }
      },
    });
  };

  // Cấu hình cột table
  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            icon={<UserOutlined />}
            style={{ marginRight: 12, backgroundColor: '#52c41a' }}
          />
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <code>{text}</code>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'staff' ? 'blue' : 'green'}>
          {type === 'staff' ? 'Nhân viên' : 'Khách hàng'}
        </Tag>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleConfig = {
          admin: { color: 'red', text: 'Quản trị viên' },
          staff: { color: 'blue', text: 'Nhân viên' },
          user: { color: 'green', text: 'Khách hàng' }
        };
        const config = roleConfig[role] || roleConfig.user;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          size="small"
          style={{ width: 100 }}
          onChange={(value) => handleStatusChange(record, value)}
        >
          <Option value="active">
            <Tag color="green">Hoạt động</Tag>
          </Option>
          <Option value="inactive">
            <Tag color="red">Khóa</Tag>
          </Option>
        </Select>
      ),
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
            onClick={() => navigate(`/users/${record.id}/edit`)}
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
      onClick={() => navigate('/users/new')}
    >
      Thêm người dùng
    </Button>
  );

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        subtitle="Danh sách nhân viên và khách hàng trong hệ thống"
        extra={headerExtra}
      />

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm theo tên, email, SĐT..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: 300 }}
            onSearch={handleSearch}
          />

          <Select
            placeholder="Loại người dùng"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilter('type', value)}
            value={filters.type}
          >
            <Option value="staff">Nhân viên</Option>
            <Option value="user">Khách hàng</Option>
          </Select>

          <Select
            placeholder="Vai trò"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilter('role', value)}
            value={filters.role}
          >
            <Option value="admin">Quản trị viên</Option>
            <Option value="staff">Nhân viên</Option>
            <Option value="user">Khách hàng</Option>
          </Select>

          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilter('status', value)}
            value={filters.status}
          >
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Khóa</Option>
          </Select>
        </Space>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
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

export default UserListPage;