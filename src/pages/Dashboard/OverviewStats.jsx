import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Skeleton, Space } from "antd";
import ReactApexChart from "react-apexcharts";
import {
  OrderedListOutlined,
  DollarOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { fetchDashboardOverview } from "../../api/dashboard";

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

const OverviewStats = () => {
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({});
  const [userStats, setUserStats] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const overview = await fetchDashboardOverview();
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
          completedTrend: orders?.trend?.completed || {},
          revenueTrend: revenue?.trend || {},
          dailyCompleted: orders?.dailyCompleted || [],
          dailyRevenue: revenue?.daily || [],
        });
        setUserStats({
          ...users,
          customerTrend: users?.trend?.customer || {},
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const css = (name, fallback) =>
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
      : fallback;
  const primary = css('--color-primary', '#00ac45');
  const success = css('--color-success-strong', '#0b421a');
  const warning = css('--color-warning', '#ffbc00');
  const border = css('--color-border', 'rgba(1,50,55,0.06)');

  // simple sparkline data (placeholder)
  const orderSparkSeries = (orderStats?.dailyCompleted || []).map(d => d.value);
  const revenueSparkSeries = (orderStats?.dailyRevenue || []).map(d => d.revenue);
  const customerSparkSeries = (userStats?.dailyCustomers || []).map(d => d.value);

  const spark = (color, data) => ({
    chart: { type: 'area', sparkline: { enabled: true } },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 0.3, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 60, 100] } },
    colors: [color],
    grid: { borderColor: border },
    tooltip: { y: { formatter: (v) => v?.toString() } },
  });

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}>
        <Card className="overview-stat success">
          {loading ? (
            <Skeleton active paragraph={false} />
          ) : (
            <>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div className="title">Đơn hoàn thành (7 ngày)</div>
                <div className="badge" style={{ background: (orderStats?.completedTrend?.changePct || 0) >= 0 ? 'var(--color-success-strong)' : 'var(--color-danger)', color: '#fff' }}>
                  {(orderStats?.completedTrend?.changePct || 0) > 0 ? '+' : ''}{orderStats?.completedTrend?.changePct || 0}%
                </div>
              </Space>
              <div className="value">{orderStats.completed || 0}</div>
              <div className="sparkline">
                <ReactApexChart type="area" options={spark(success, orderSparkSeries)} series={[{ data: orderSparkSeries }]} height={54} />
              </div>
            </>
          )}
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card className="overview-stat">
          {loading ? (
            <Skeleton active paragraph={false} />
          ) : (
            <>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div className="title">Doanh thu (7 ngày)</div>
                <div className="badge" style={{ background: (orderStats?.revenueTrend?.changePct || 0) >= 0 ? 'var(--color-primary)' : 'var(--color-danger)', color: '#fff' }}>
                  {(orderStats?.revenueTrend?.changePct || 0) > 0 ? '+' : ''}{orderStats?.revenueTrend?.changePct || 0}%
                </div>
              </Space>
              <div className="value">{vnd.format(Number(orderStats.totalRevenue || 0))}</div>
              <div className="sparkline">
                <ReactApexChart type="area" options={spark(primary, revenueSparkSeries)} series={[{ data: revenueSparkSeries }]} height={54} />
              </div>
            </>
          )}
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card className="overview-stat warning">
          {loading ? (
            <Skeleton active paragraph={false} />
          ) : (
            <>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div className="title">Khách hàng mới (7 ngày)</div>
                <div className="badge" style={{ background: (userStats?.customerTrend?.changePct || 0) >= 0 ? 'var(--color-warning)' : 'var(--color-danger)', color: '#fff' }}>
                  {(userStats?.customerTrend?.changePct || 0) > 0 ? '+' : ''}{userStats?.customerTrend?.changePct || 0}%
                </div>
              </Space>
              <div className="value">{userStats.customer || 0}</div>
              <div className="sparkline">
                <ReactApexChart type="area" options={spark(warning, customerSparkSeries)} series={[{ data: customerSparkSeries }]} height={54} />
              </div>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default OverviewStats;
