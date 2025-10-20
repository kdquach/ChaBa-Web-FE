import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Progress, Alert } from 'antd';
import {
  ShoppingOutlined,
  OrderedListOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import OverviewStats from './OverviewStats';
import RevenueAreaChart from './RevenueAreaChart';
import TopProductsPie from './TopProductsPie';
import { getOrderStats } from '../../api/orders';
import { getUserStats } from '../../api/users';
// import { getStockAlerts } from "../../api/ingredients";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [stockAlerts, setStockAlerts] = useState([]);
  const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

  // Mock dữ liệu gần đây
  const recentOrders = [
    {
      key: '1',
      orderNumber: 'ORD001',
      customer: 'Nguyễn Văn A',
      total: 85000,
      status: 'completed',
    },
    {
      key: '2',
      orderNumber: 'ORD002',
      customer: 'Trần Thị B',
      total: 30000,
      status: 'processing',
    },
    {
      key: '3',
      orderNumber: 'ORD003',
      customer: 'Lê Văn C',
      total: 93000,
      status: 'pending',
    },
  ];

  const recentOrderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (value) => vnd.format(Number(value || 0)),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'Chờ xử lý' },
          processing: { color: 'blue', text: 'Đang xử lý' },
          completed: { color: 'green', text: 'Hoàn thành' },
          cancelled: { color: 'red', text: 'Đã hủy' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [orders, users, alerts] = await Promise.all([
          getOrderStats(),
          getUserStats(),
          // getStockAlerts(),
        ]);

        setOrderStats(orders);
        setUserStats(users);
        setStockAlerts(alerts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner tip="Đang tải dashboard..." />;
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Tổng quan hoạt động kinh doanh" />

      {/* Row 1: Overview full width */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <OverviewStats />
        </Col>
      </Row>

      {/* Row 2: Area chart (16) + Pie (8) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <RevenueAreaChart />
        </Col>
        <Col xs={24} lg={8}>
          <TopProductsPie />
        </Col>
      </Row>

      {/* Row 3: Order status (8) + Recent orders (16) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Trạng thái đơn hàng" style={{ height: 400 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#fa8c16',
                    }}
                  >
                    {orderStats.pending || 0}
                  </div>
                  <div>Chờ xử lý</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#1890ff',
                    }}
                  >
                    {orderStats.processing || 0}
                  </div>
                  <div>Đang xử lý</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#52c41a',
                    }}
                  >
                    {orderStats.completed || 0}
                  </div>
                  <div>Hoàn thành</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#ff4d4f',
                    }}
                  >
                    {orderStats.cancelled || 0}
                  </div>
                  <div>Đã hủy</div>
                </div>
              </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 8 }}>Tỷ lệ hoàn thành</div>
              <Progress
                percent={
                  orderStats.total
                    ? Math.round(
                        (orderStats.completed / orderStats.total) * 100
                      )
                    : 0
                }
                status="active"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Đơn hàng gần đây" style={{ height: 400 }}>
            <Table
              dataSource={recentOrders}
              columns={recentOrderColumns}
              pagination={false}
              size="small"
              scroll={{ y: 280 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
