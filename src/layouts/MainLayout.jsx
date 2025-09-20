import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Breadcrumb,
  Badge,
  Space,
  Typography
} from 'antd';
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
  BellOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

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
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Quản lý sản phẩm',
      children: [
        {
          key: '/products',
          label: 'Danh sách sản phẩm'
        },
        {
          key: '/products/new',
          label: 'Thêm sản phẩm mới'
        }
      ]
    },
    {
      key: '/orders',
      icon: <OrderedListOutlined />,
      label: 'Quản lý đơn hàng',
      children: [
        {
          key: '/orders',
          label: 'Danh sách đơn hàng'
        },
        {
          key: '/orders/new',
          label: 'Tạo đơn hàng'
        }
      ]
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
      children: [
        {
          key: '/users',
          label: 'Danh sách người dùng'
        },
        {
          key: '/users/new',
          label: 'Thêm người dùng'
        }
      ]
    },
    {
      key: '/ingredients',
      icon: <InboxOutlined />,
      label: 'Quản lý nguyên liệu',
      children: [
        {
          key: '/ingredients',
          label: 'Danh sách nguyên liệu'
        },
        {
          key: '/ingredients/new',
          label: 'Thêm nguyên liệu'
        }
      ]
    },
    {
      key: '/toppings',
      icon: <PlusOutlined />,
      label: 'Quản lý topping',
      children: [
        {
          key: '/toppings',
          label: 'Danh sách topping'
        },
        {
          key: '/toppings/new',
          label: 'Thêm topping'
        }
      ]
    }
  ];

  // Dropdown menu cho user
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
    },
  ];

  // Xử lý click menu
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // Xử lý click user menu
  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
    // Xử lý các menu item khác
  };

  // Tạo breadcrumb từ current path
  const generateBreadcrumb = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const breadcrumbItems = [
      {
        title: 'Trang chủ',
        href: '/'
      }
    ];

    const pathMap = {
      'products': 'Sản phẩm',
      'orders': 'Đơn hàng', 
      'users': 'Người dùng',
      'ingredients': 'Nguyên liệu',
      'toppings': 'Topping',
      'new': 'Thêm mới',
      'edit': 'Chỉnh sửa'
    };

    pathSnippets.forEach((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const title = pathMap[snippet] || snippet;
      
      breadcrumbItems.push({
        title,
        href: url
      });
    });

    return breadcrumbItems;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: 64, 
          margin: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Title 
            level={4} 
            style={{ 
              color: 'white', 
              margin: 0,
              fontSize: collapsed ? 16 : 18
            }}
          >
            {collapsed ? 'BT' : 'Bubble Tea'}
          </Title>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[location.pathname.split('/')[1] ? `/${location.pathname.split('/')[1]}` : '/']}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 250 }}>
        {/* Header */}
        <Header style={{ 
          padding: 0, 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            
            <Breadcrumb
              items={generateBreadcrumb()}
              style={{ margin: '0 16px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', paddingRight: 24 }}>
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
                  onClick: handleUserMenuClick
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar 
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                  <span>{user?.name}</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 6,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;