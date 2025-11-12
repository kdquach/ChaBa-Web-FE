  import React, { useState, useEffect } from 'react';
  import { Row, Col, Card, Table, Tag } from 'antd';
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
  import { fetchDashboardOverview, fetchRecentOrders } from '../../api/dashboard';
  // import { getStockAlerts } from "../../api/ingredients";

  const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
    const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

    // Recent orders now fetched from backend

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
          const [overview, recent] = await Promise.all([
            fetchDashboardOverview(),
            fetchRecentOrders({ limit: 5 }),
          ]);
          const orders = overview?.orders || {};
          const revenue = overview?.revenue || {};
          const users = overview?.users || {};
          setOrderStats({
            total: orders.total,
            pending: orders.pending,
            processing: orders.processing,
            completed: orders.completed,
            cancelled: orders.cancelled,
            totalRevenue: revenue.totalRevenue,
          });
          setUserStats(users);
          setRecentOrders((recent || []).map((o) => ({
            key: o.id,
            orderNumber: o.orderNumber,
            customer: o.customer,
            total: o.total,
            status: o.status,
          })));
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
            <Card className="stat-card" title="Trạng thái đơn hàng" style={{ height: 400 }}>
              {(() => {
                const pending = Number(orderStats.pending || 0);
                const processing = Number(orderStats.processing || 0);
                const completed = Number(orderStats.completed || 0);
                const cancelled = Number(orderStats.cancelled || 0);
                const total = Number(orderStats.total || (pending + processing + completed + cancelled) || 0);

                const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

                const legendItem = (colorVar, label, count) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 10, background: `var(${colorVar})` }} />
                    <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--color-text-dark)' }}>{count}</span>
                  </div>
                );

                return (
                  <div>
                    {/* Stacked progress bar */}
                    <div
                      style={{
                        marginTop: 8,
                        display: 'flex',
                        height: 14,
                        borderRadius: 999,
                        overflow: 'hidden',
                        background: 'rgba(0,0,0,0.06)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                      }}
                      title={`Tổng: ${total}`}
                    >
                      {pending > 0 && (
                        <div
                          style={{ width: `${pct(pending)}%`, background: 'var(--color-warning)', transition: 'width 300ms ease' }}
                          title={`Chờ xử lý: ${pending} (${pct(pending)}%)`}
                        />
                      )}
                      {processing > 0 && (
                        <div
                          style={{ width: `${pct(processing)}%`, background: 'var(--color-accent)', transition: 'width 300ms ease' }}
                          title={`Đang xử lý: ${processing} (${pct(processing)}%)`}
                        />
                      )}
                      {completed > 0 && (
                        <div
                          style={{ width: `${pct(completed)}%`, background: 'var(--color-success-strong)', transition: 'width 300ms ease' }}
                          title={`Hoàn thành: ${completed} (${pct(completed)}%)`}
                        />
                      )}
                      {cancelled > 0 && (
                        <div
                          style={{ width: `${pct(cancelled)}%`, background: 'var(--color-danger)', transition: 'width 300ms ease' }}
                          title={`Đã hủy: ${cancelled} (${pct(cancelled)}%)`}
                        />
                      )}
                    </div>

                    {/* Percent labels below the bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Chờ xử lý</div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-dark)' }}>{pct(pending)}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Đang xử lý</div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-dark)' }}>{pct(processing)}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Hoàn thành</div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-dark)' }}>{pct(completed)}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Đã hủy</div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-dark)' }}>{pct(cancelled)}%</div>
                      </div>
                    </div>

                    {/* Count legend */}
                    <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                      {legendItem('--color-warning', 'Chờ xử lý', pending)}
                      {legendItem('--color-accent', 'Đang xử lý', processing)}
                      {legendItem('--color-success-strong', 'Hoàn thành', completed)}
                      {legendItem('--color-danger', 'Đã hủy', cancelled)}
                    </div>
                  </div>
                );
              })()}
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card className="table-card" title="Đơn hàng gần đây" style={{ height: 400 }}>
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
