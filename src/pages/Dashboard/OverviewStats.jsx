import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Skeleton } from "antd";
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

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          {loading ? (
            <Skeleton active paragraph={false} />
          ) : (
            <Statistic
              title="Tổng đơn hàng"
              value={orderStats.total || 0}
              prefix={<OrderedListOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          )}
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          {loading ? (
            <Skeleton active paragraph={false} />
          ) : (
            <Statistic
              title="Doanh thu"
              value={orderStats.totalRevenue || 0}
              prefix={<DollarOutlined />}
              formatter={(val) => vnd.format(Number(val || 0))}
              valueStyle={{ color: "#52c41a" }}
            />
          )}
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          {loading ? (
            <Skeleton active paragraph={false} />
          ) : (
            <Statistic
              title="Tổng người dùng"
              value={userStats.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          )}
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          {loading ? (
            <Skeleton active paragraph={false} />
          ) : (
            <Statistic
              title="Khách hàng"
              value={userStats.customer || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default OverviewStats;
