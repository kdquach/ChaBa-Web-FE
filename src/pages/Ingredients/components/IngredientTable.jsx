import React from 'react';
import { Table, Button, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StockStatusTag from './StockStatusTag';

const IngredientTable = ({
  data,
  loading,
  pagination,
  onTableChange,
  onDelete,
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (_, record) => (
        <StockStatusTag
          stock={record.stock}
          minStock={record.minStock}
          maxStock={record.maxStock}
        />
      ),
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price?.toLocaleString() || '—',
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier) => supplier || '—',
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) =>
        date ? new Date(date).toLocaleDateString('vi-VN') : '—',
    },
    {
      title: 'Danh mục',
      dataIndex: ['categoryId', 'name'],
      key: 'category',
      render: (value, record) => record.categoryId?.name || 'Chưa phân loại',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
            onClick={() => navigate(`/ingredients/${record.id}/view`)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: '#faad14' }} />}
            onClick={() => navigate(`/ingredients/${record.id}/edit`)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      onChange={onTableChange}
      scroll={{ x: 700 }}
      size="middle"
    />
  );
};

export default IngredientTable;
