import React from "react";
import { Layout, Card, Typography, Image } from "antd";
import { CoffeeOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title } = Typography;

const AuthLayout = ({ children }) => {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            borderRadius: 12,
          }}
          bodyStyle={{ padding: "40px 32px" }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            <Image
              width={64}
              preview={false}
              src="../../assets/thetrois-logo.jpg"
              alt="Logo"
              style={{ marginBottom: 16 }}
            />
            <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
              Bubble Tea Shop
            </Title>
            <p
              style={{
                color: "#6b7280",
                margin: "8px 0 0 0",
                fontSize: 16,
              }}
            >
              Hệ thống quản lý quán trà sữa
            </p>
          </div>

          {children}
        </Card>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
