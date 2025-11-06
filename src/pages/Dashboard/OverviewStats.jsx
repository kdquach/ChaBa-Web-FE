import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Skeleton, Space } from "antd";
import ReactApexChart from "react-apexcharts";
import {
  OrderedListOutlined,
  DollarOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { getOrderStats } from "../../api/orders";
import { getUserStats } from "../../api/users";

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

const OverviewStats = () => {
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({});
  const [userStats, setUserStats] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [o, u] = await Promise.all([getOrderStats(), getUserStats()]);
        setOrderStats(o || {});
        setUserStats(u || {});
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
  const randomSeries = useMemo(() => Array.from({ length: 12 }, () => Math.round(Math.random() * 100) + 20), [loading]);
  const spark = (color) => ({
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
                <div className="title">Tổng đơn hàng</div>
                <div className="badge">+4.5%</div>
              </Space>
              <div className="value">{orderStats.total || 0}</div>
              <div className="sparkline">
                <ReactApexChart type="area" options={spark(success)} series={[{ data: randomSeries }]} height={54} />
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
                <div className="title">Doanh thu</div>
                <div className="badge">+3.2%</div>
              </Space>
              <div className="value">{vnd.format(Number(orderStats.totalRevenue || 0))}</div>
              <div className="sparkline">
                <ReactApexChart type="area" options={spark(primary)} series={[{ data: randomSeries }]} height={54} />
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
                <div className="title">Khách hàng</div>
                <div className="badge">+1.2%</div>
              </Space>
              <div className="value">{userStats.customer || 0}</div>
              <div className="sparkline">
                <ReactApexChart type="area" options={spark(warning)} series={[{ data: randomSeries }]} height={54} />
              </div>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default OverviewStats;
