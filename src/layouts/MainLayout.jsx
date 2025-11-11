import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Breadcrumb,
  Badge,
  Space,
  Typography,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  UserOutlined,
  InboxOutlined,
  PlusOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items cho sidebar
  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/categories",
      icon: <InboxOutlined />,
      label: "Quản lý danh mục",
      children: [
        { key: "/categories", label: "Danh sách danh mục" },
        { key: "/categories/new", label: "Thêm danh mục" },
      ],
    },
    {
      key: "/products",
      icon: <ShoppingOutlined />,
      label: "Quản lý sản phẩm",
      children: [
        {
          key: "/products",
          label: "Danh sách sản phẩm",
        },
        {
          key: "/products/new",
          label: "Thêm sản phẩm mới",
        },
      ],
    },
    {
      key: "/orders",
      icon: <OrderedListOutlined />,
      label: "Quản lý đơn hàng",
      children: [
        {
          key: "/orders",
          label: "Danh sách đơn hàng",
        },
        {
          key: "/orders/new",
          label: "Tạo đơn hàng",
        },
      ],
    },
    {
      key: "/order-staff",
      icon: <OrderedListOutlined />,
      label: "Quản lý đơn hàng staff",
      children: [
        {
          key: "/order-staff",
          label: "Danh sách đơn hàng staff",
        },
        // {
        //   key: '/orders/new',
        //   label: 'Tạo đơn hàng',
        // },
      ],
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      children: [
        {
          key: "/users",
          label: "Danh sách người dùng",
        },
        {
          key: "/users/new",
          label: "Thêm người dùng",
        },
      ],
    },
    {
      key: "/ingredients",
      icon: <InboxOutlined />,
      label: "Quản lý nguyên liệu",
      children: [
        {
          key: "/ingredients",
          label: "Danh sách nguyên liệu",
        },
        // {
        //   key: '/ingredients/new',
        //   label: 'Thêm nguyên liệu',
        // },
        { key: "/ingredient-categories", label: "Danh sách loại nguyên liệu" },
      ],
    },
    {
      key: "/toppings",
      icon: <PlusOutlined />,
      label: "Quản lý topping",
      children: [
        {
          key: "/toppings",
          label: "Danh sách topping",
        },
        {
          key: "/toppings/new",
          label: "Thêm topping",
        },
      ],
    },
  ];

  // add tooltip title for collapsed mode
  const withTitles = (items) =>
    items.map((it) =>
      it.children
        ? {
            ...it,
            title: typeof it.label === "string" ? it.label : undefined,
            children: withTitles(it.children),
          }
        : { ...it, title: typeof it.label === "string" ? it.label : undefined }
    );
  const menuData = useMemo(() => withTitles(menuItems), []);

  // Dropdown menu cho user
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  // Xử lý click menu
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // Xử lý click user menu
  const handleUserMenuClick = ({ key }) => {
    if (key === "logout") {
      logout();
      navigate("/login");
    }
    // Xử lý các menu item khác
  };

  // Tạo breadcrumb từ current path
  const generateBreadcrumb = () => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const breadcrumbItems = [
      {
        title: "Trang chủ",
        href: "/",
      },
    ];

    const pathMap = {
      products: "Sản phẩm",
      orders: "Đơn hàng",
      users: "Người dùng",
      ingredients: "Nguyên liệu",
      toppings: "Topping",
      categories: "Danh mục",
      new: "Thêm mới",
      edit: "Chỉnh sửa",
    };

    pathSnippets.forEach((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const title = pathMap[snippet] || snippet;

      breadcrumbItems.push({
        title,
        href: url,
      });
    });

    return breadcrumbItems;
  };

  // Auto collapse when viewport < 980-992px
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 980) setCollapsed(true);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Layout className="app-shell" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        collapsedWidth={72}
        width={250}
        className="app-sider"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
      >
        <div className="logo-box">
          <Title
            level={4}
            style={{
              color: "var(--color-text-dark)",
              margin: 0,
              fontSize: collapsed ? 16 : 18,
              display: "flex",
              alignItems: "center",
              gap: 8, // khoảng cách giữa logo và chữ
            }}
          >
            <img
              src={
                collapsed
                  ? "../../assets/Logo.png"
                  : "../../assets/Logo-expand.png"
              }
              alt="TheTrois Logo"
              style={{
                width: collapsed ? 40 : 120,
                height: "auto",
              }}
            />
          </Title>
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[
            location.pathname.split("/")[1]
              ? `/${location.pathname.split("/")[1]}`
              : "/",
          ]}
          inlineCollapsed={collapsed}
          items={menuData}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 72 : 250 }}>
        {/* Header */}
        <Header
          className="app-header"
          style={{
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
              className="sider-toggle"
            />

            <Breadcrumb
              className="app-breadcrumb"
              items={generateBreadcrumb()}
              style={{ margin: "0 16px" }}
            />
          </div>

          <div
            style={{ display: "flex", alignItems: "center", paddingRight: 24 }}
          >
            <Space size={16}>
              {/* Notification Bell */}
              <Badge count={3} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{ fontSize: 18 }}
                />
              </Badge>

              {/* User Menu */}
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Space style={{ cursor: "pointer" }}>
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#52c41a" }}
                  />
                  <span>{user?.name}</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* Content */}
        <Content
          className="app-content"
          style={{
            margin: "24px 16px",
            minHeight: 280,
          }}
        >
          <div className="content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
