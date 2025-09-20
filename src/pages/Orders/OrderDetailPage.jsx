import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Table, Tag, Button, Space, message, Steps } from 'antd';
import { EditOutlined, PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getOrder } from '../../api/orders';

const OrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await getOrder(id);
      setOrder(response);
    } catch (error) {
      message.error('Không thể tải thông tin đơn hàng');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return null;
  }

  // Cấu hình trạng thái order
  const statusConfig = {
    pending: { color: 'orange', text: 'Chờ xử lý', step: 0 },
    processing: { color: 'blue', text: 'Đang xử lý', step: 1 },
    completed: { color: 'green', text: 'Hoàn thành', step: 2 },
    cancelled: { color: 'red', text: 'Đã hủy', step: -1 }
  };

  const paymentStatusConfig = {
    pending: { color: 'orange', text: 'Chưa thanh toán' },
    paid: { color: 'green', text: 'Đã thanh toán' },
    failed: { color: 'red', text: 'Thất bại' }
  };

  const paymentMethodConfig = {
    cash: 'Tiền mặt',
    card: 'Thẻ tín dụng',
    transfer: 'Chuyển khoản',
    ewallet: 'Ví điện tử'
  };

  // Cấu hình cột cho bảng items
  const itemColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      render: (price) => `${price.toLocaleString()} ₫`,
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <span style={{ fontWeight: 500 }}>
          {(record.quantity * record.price).toLocaleString()} ₫
        </span>
      ),
    },
  ];

  const currentStatus = statusConfig[order.status];

  const headerExtra = (
    <Space>
      <Button icon={<PrinterOutlined />}>
        In đơn hàng
      </Button>
      <Button 
        type="primary" 
        icon={<EditOutlined />}
        onClick={() => navigate(`/orders/${id}/edit`)}
      >
        Chỉnh sửa
      </Button>
    </Space>
  );

  return (
    <div>
      <PageHeader
        title={`Chi tiết đơn hàng ${order.orderNumber}`}
        subtitle={`Tạo ngày ${dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}`}
        showBack
        backPath="/orders"
        extra={headerExtra}
      />

      {/* Trạng thái đơn hàng */}
      {order.status !== 'cancelled' && (
        <Card style={{ marginBottom: 16 }}>
          <Steps
            current={currentStatus.step}
            status={order.status === 'cancelled' ? 'error' : 'process'}
            items={[
              {
                title: 'Chờ xử lý',
                description: 'Đơn hàng đã được tạo',
              },
              {
                title: 'Đang xử lý',
                description: 'Đang chuẩn bị đơn hàng',
              },
              {
                title: 'Hoàn thành',
                description: 'Đơn hàng đã hoàn thành',
              },
            ]}
          />
        </Card>
      )}

      {/* Thông tin đơn hàng */}
      <Card title="Thông tin đơn hàng" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="Mã đơn hàng">
            <strong>{order.orderNumber}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={currentStatus.color}>{currentStatus.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Tên khách hàng">
            {order.customerName}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {order.customerPhone}
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">
            {paymentMethodConfig[order.paymentMethod] || order.paymentMethod}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái thanh toán">
            <Tag color={paymentStatusConfig[order.paymentStatus].color}>
              {paymentStatusConfig[order.paymentStatus].text}
            </Tag>
          </Descriptions.Item>
          {order.notes && (
            <Descriptions.Item label="Ghi chú" span={2}>
              {order.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Chi tiết sản phẩm */}
      <Card title="Chi tiết sản phẩm" style={{ marginBottom: 16 }}>
        <Table
          columns={itemColumns}
          dataSource={order.items}
          rowKey="id"
          pagination={false}
          size="small"
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={3}>
                  <strong>Tạm tính</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell align="right">
                  <strong>{order.subtotal.toLocaleString()} ₫</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              
              {order.discount > 0 && (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={3}>
                    <strong>Giảm giá</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <strong style={{ color: '#ff4d4f' }}>
                      -{order.discount.toLocaleString()} ₫
                    </strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
              
              <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                <Table.Summary.Cell colSpan={3}>
                  <strong style={{ fontSize: 16 }}>Tổng cộng</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell align="right">
                  <strong style={{ fontSize: 16, color: '#52c41a' }}>
                    {order.total.toLocaleString()} ₫
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
};

export default OrderDetailPage;