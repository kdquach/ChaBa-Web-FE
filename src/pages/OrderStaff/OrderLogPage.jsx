import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Typography, message, Modal } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { fetchOrderLogs, deleteOrderLog } from '../../api/orderStaff';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

const { confirm } = Modal;

export default function OrderLogPage() {
  const { orderId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const res = await fetchOrderLogs(orderId);
      setLogs(res.results || []);
    } catch (err) {
      console.error('Lỗi khi tải log:', err);
      message.error('Không thể tải log đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (log) => {
    confirm({
      title: 'Xác nhận xóa log',
      content: `Bạn có chắc muốn xóa log này?`,
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteOrderLog(log.id);
          message.success('Đã xóa log thành công');
          setLogs((prev) => prev.filter((l) => l.id !== log.id));
        } catch (err) {
          console.error('Lỗi xóa log:', err);
          message.error('Không thể xóa log');
        }
      },
    });
  };

  useEffect(() => {
    loadLogs();
  }, [orderId]);

  const columns = [
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
          title="Xóa log"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) =>
        record.changedBy?.name
          ? `Cập nhật trạng thái bởi ${record.changedBy.name}`
          : 'Cập nhật trạng thái',
    },
    {
      title: 'Trạng thái cũ',
      dataIndex: 'previousStatus',
      key: 'previousStatus',
      render: (text) => text || '—',
    },
    {
      title: 'Trạng thái mới',
      dataIndex: 'newStatus',
      key: 'newStatus',
      render: (text) => text || '—',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (text) => text || '—',
    },
    {
      title: 'Ngày tạo log',
      dataIndex: 'changedAt',
      key: 'changedAt',
      render: (text) => (text ? new Date(text).toLocaleString() : '—'),
    },
  ];

  if (loading && logs.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title={`🧾 Lịch sử đơn #ORD${
          orderId ? orderId.slice(-3).toUpperCase() : ''
        }`}
        subtitle="Danh sách log thay đổi trạng thái"
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadLogs}>
            Làm mới
          </Button>
        }
      />

      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
          size="small"
        />
        {logs.length === 0 && !loading && (
          <Typography.Text type="secondary">
            Không có log nào cho đơn hàng này.
          </Typography.Text>
        )}
      </Card>
    </div>
  );
}
