import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Space, Table, Tag, Select, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { deleteAddress, getAddresses } from '../../api/addresses';
import { getUsers } from '../../api/users';
import PageHeader from '../../components/PageHeader';

const AddressListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState();
  const [sorterState, setSorterState] = useState(null);
  const location = useLocation();
  const initRef = useRef(false);

  const loadUsers = async () => {
    try {
      const res = await getUsers({ limit: 100, page: 1 });
      const list = res?.data || res;
      setUsers(list);
    } catch { }
  };

  const fetchData = async (page = 1, pageSize = 10, q = search, sorter) => {
    setLoading(true);
    try {
      let sortBy;
      if (sorter && sorter.field && sorter.order) {
        const dir = sorter.order === 'descend' ? 'desc' : 'asc';
        sortBy = `${sorter.field}:${dir}`;
      }
      const params = { page, limit: pageSize, q, sortBy };
      if (userId) params.userId = userId;
      const res = await getAddresses(params);
      setData(res.results || []);
      setPagination({
        current: res.page || page,
        pageSize: res.limit || pageSize,
        total: res.totalResults || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    fetchData(1, pagination.pageSize, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize user filter from query string ONCE (e.g., ?userId=...), then drop it
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const params = new URLSearchParams(location.search);
    const initial = params.get('userId');
    if (initial) {
      setUserId(initial);
      // Remove the query param so later actions don't persist this filter unintentionally
      navigate('/addresses', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const onTableChange = (newPagination, filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] || null : sorter || null;
    setSorterState(s);
    fetchData(newPagination.current, newPagination.pageSize, search, s);
  };

  // Align with CategoryListPage: update state, reset to page 1, and reload using helper
  const handleSearch = (value) => {
    setSearch(value);
    const newPaging = { ...pagination, current: 1 };
    setPagination(newPaging);
    fetchData(1, pagination.pageSize, value);
  };

  const handleDelete = async (record) => {
    await deleteAddress(record.id || record._id);
    fetchData(pagination.current, pagination.pageSize, search, sorterState);
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize, search, sorterState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const columns = useMemo(
    () => [
      {
        title: '#',
        dataIndex: 'index',
        width: 60,
        render: (_, __, idx) =>
          (pagination.current - 1) * pagination.pageSize + idx + 1,
      },
      {
        title: 'Người dùng',
        dataIndex: 'user',
        sorter: true,
        render: (user) => {
          if (!user) return '—';
          // If backend populated user object
          if (typeof user === 'object') return user.name || user.username || '—';
          // Else it's an id string: try map to name from loaded users
          const found = (users || []).find((u) => (u.id || u._id) === user);
          return found ? (found.name || found.username || '—') : user;
        },
      },
      {
        title: 'SĐT',
        dataIndex: 'phone',
        width: 140,
      },
      {
        title: 'Địa chỉ',
        dataIndex: 'addressLine',
        render: (text, record) =>
          `${text || ''}${record.ward ? ', ' + record.ward : ''}${record.district ? ', ' + record.district : ''
          }${record.city ? ', ' + record.city : ''}`,
      },
      {
        title: 'Mặc định',
        dataIndex: 'isDefault',
        width: 140,
        render: (val) =>
          val ? (
            <Tag color="green">Mặc định</Tag>
          ) : (
            <Tag color="default">Không mặc định</Tag>
          ),
      },
      { title: 'Ngày tạo', dataIndex: 'createdAt', sorter: true, render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm'), width: 180, },
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
              onClick={() =>
                navigate(`/addresses/${record.id || record._id}/edit`, { state: { fromList: true } })
              }
            />
            <Popconfirm
              title="Xóa địa chỉ?"
              description="Bạn có chắc chắn muốn xóa địa chỉ này?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => handleDelete(record)}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [navigate, pagination.current, pagination.pageSize, users]
  );

  return (
    <div>
      <PageHeader title="Quản lý địa chỉ" />

      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <Input.Search
          placeholder="Tìm kiếm địa chỉ..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
          allowClear
          style={{ maxWidth: 360 }}
        />
        <Select
          allowClear
          placeholder="Lọc theo người dùng"
          style={{ minWidth: 260 }}
          value={userId}
          onChange={setUserId}
          showSearch
          optionFilterProp="label"
          options={(users || []).map((u) => ({
            value: u.id || u._id,
            label: `${u.name || u.username} - ${u.phone || ''}`,
          }))}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/addresses/new')}
        >
          Thêm địa chỉ
        </Button>
      </div>

      <Table
        rowKey={(r) => r.id || r._id}
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
        }}
        onChange={onTableChange}
      />
    </div>
  );
};

export default AddressListPage;
