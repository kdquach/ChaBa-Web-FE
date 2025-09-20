import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Table, Tag, Progress, Alert } from "antd";
import {
  ShoppingOutlined,
  OrderedListOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getOrderStats } from "../../api/orders";
import { getUserStats } from "../../api/users";
import { getStockAlerts } from "../../api/ingredients";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [stockAlerts, setStockAlerts] = useState([]);

  // Mock dữ liệu gần đây
  const recentOrders = [
    {
      key: "1",
      orderNumber: "ORD001",
      customer: "Nguyễn Văn A",
      total: 85000,
      status: "completed",
    },
    {
      key: "2",
      orderNumber: "ORD002",
      customer: "Trần Thị B",
      total: 30000,
      status: "processing",
    },
    {
      key: "3",
      orderNumber: "ORD003",
      customer: "Lê Văn C",
      total: 93000,
      status: "pending",
    },
  ];

  const recentOrderColumns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (value) => `${value.toLocaleString()} ₫`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          pending: { color: "orange", text: "Chờ xử lý" },
          processing: { color: "blue", text: "Đang xử lý" },
          completed: { color: "green", text: "Hoàn thành" },
          cancelled: { color: "red", text: "Đã hủy" },
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
          getStockAlerts(),
        ]);

        setOrderStats(orders);
        setUserStats(users);
        setStockAlerts(alerts);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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

      {/* Cảnh báo nguyên liệu */}
      {stockAlerts.length > 0 && (
        <Alert
          message={`Cảnh báo: ${stockAlerts.length} nguyên liệu sắp hết hoặc đã hết hàng`}
          description={
            <div>
              {stockAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id}>
                  <strong>{alert.name}:</strong> {alert.currentStock}/
                  {alert.minStock}{" "}
                  {alert.type === "out_of_stock" ? "(Hết hàng)" : "(Sắp hết)"}
                </div>
              ))}
              {stockAlerts.length > 3 && (
                <div>... và {stockAlerts.length - 3} nguyên liệu khác</div>
              )}
            </div>
          }
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={orderStats.total || 0}
              prefix={<OrderedListOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={orderStats.totalRevenue || 0}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={userStats.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={userStats.customer || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ và bảng */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Trạng thái đơn hàng" style={{ height: 400 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#fa8c16",
                    }}
                  >
                    {orderStats.pending || 0}
                  </div>
                  <div>Chờ xử lý</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {orderStats.processing || 0}
                  </div>
                  <div>Đang xử lý</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#52c41a",
                    }}
                  >
                    {orderStats.completed || 0}
                  </div>
                  <div>Hoàn thành</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#ff4d4f",
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

        <Col xs={24} lg={12}>
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
