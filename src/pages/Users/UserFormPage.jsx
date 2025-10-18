import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Switch, message, Card, Row, Col, Checkbox, Space } from 'antd';
import { SaveOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createUser, updateUser, getUser } from '../../api/users';
import { PERMISSIONS } from '../../utils/auth';

const { Option } = Select;
const { TextArea } = Input;

const UserFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userType, setUserType] = useState('user');

  useEffect(() => {
    if (isEditing) {
      loadUser();
    }
  }, [id, isEditing]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const user = await getUser(id);
      form.setFieldsValue({
        ...user,
        status: user.status === 'active',
      });
      setUserType(user.type);
    } catch (error) {
      message.error('Không thể tải thông tin người dùng');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi loại người dùng
  const handleUserTypeChange = (type) => {
    setUserType(type);

    // Reset role và permissions khi đổi type
    if (type === 'user') {
      form.setFieldsValue({
        role: 'user',
        permissions: []
      });
    } else {
      form.setFieldsValue({
        role: 'staff',
        permissions: ['manage_products', 'manage_orders']
      });
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      const userData = {
        ...values,
        status: values.status ? 'active' : 'inactive',
        permissions: values.permissions || [],
      };

      if (isEditing) {
        await updateUser(id, userData);
        message.success('Cập nhật người dùng thành công!');
      } else {
        await createUser(userData);
        message.success('Tạo người dùng thành công!');
      }

      navigate('/users');
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra khi lưu người dùng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        subtitle={isEditing ? 'Cập nhật thông tin người dùng' : 'Nhập thông tin người dùng mới'}
        showBack
        backPath="/users"
      />

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Thông tin cơ bản">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              initialValues={{
                type: 'user',
                role: 'user',
                status: true,
                permissions: [],
              }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tên người dùng"
                    name="name"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên người dùng!' },
                      { max: 100, message: 'Tên không được vượt quá 100 ký tự!' }
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Nhập tên người dùng" />
                  </Form.Item>
                </Col>

                {/* <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tên đăng nhập"
                    name="username"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                      { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
                      { max: 50, message: 'Tên đăng nhập không được vượt quá 50 ký tự!' },
                      { pattern: /^[a-zA-Z0-9_]+$/, message: 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới!' }
                    ]}
                  >
                    <Input placeholder="Nhập tên đăng nhập" />
                  </Form.Item>
                </Col> */}
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input placeholder="Nhập địa chỉ email" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại!' },
                      { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                    ]}
                  >
                    <Input placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Chỉ hiện địa chỉ cho customer */}
              {userType === 'user' && (
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                >
                  <TextArea rows={2} placeholder="Nhập địa chỉ" />
                </Form.Item>
              )}

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Loại người dùng"
                    name="type"
                    rules={[{ required: true, message: 'Vui lòng chọn loại người dùng!' }]}
                  >
                    <Select
                      placeholder="Chọn loại người dùng"
                      onChange={handleUserTypeChange}
                    >
                      <Option value="staff">Nhân viên</Option>
                      <Option value="user">Khách hàng</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Vai trò"
                    name="role"
                    rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                  >
                    <Select placeholder="Chọn vai trò">
                      {userType === 'staff' && <Option value="admin">Quản trị viên</Option>}
                      {userType === 'staff' && <Option value="staff">Nhân viên</Option>}
                      {userType === 'user' && <Option value="user">Khách hàng</Option>}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Trạng thái"
                    name="status"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Hoạt động"
                      unCheckedChildren="Khóa"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => navigate('/users')}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    icon={<SaveOutlined />}
                  >
                    {isEditing ? 'Cập nhật' : 'Tạo người dùng'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Quyền hạn - chỉ hiện cho staff */}
          {userType === 'staff' && (
            <Card title="Phân quyền">
              <Form.Item
                name="permissions"
                rules={[
                  { required: true, message: 'Vui lòng chọn ít nhất 1 quyền!' }
                ]}
              >
                <Checkbox.Group
                  style={{ width: '100%' }}
                  options={[
                    { label: 'Quản lý sản phẩm', value: PERMISSIONS.MANAGE_PRODUCTS },
                    { label: 'Quản lý đơn hàng', value: PERMISSIONS.MANAGE_ORDERS },
                    { label: 'Quản lý người dùng', value: PERMISSIONS.MANAGE_USERS },
                    { label: 'Quản lý nguyên liệu', value: PERMISSIONS.MANAGE_INGREDIENTS },
                    { label: 'Quản lý topping', value: PERMISSIONS.MANAGE_TOPPINGS },
                    { label: 'Xem báo cáo', value: PERMISSIONS.VIEW_REPORTS },
                  ]}
                />
              </Form.Item>

              <div style={{ fontSize: 12, color: '#888' }}>
                * Quản trị viên sẽ tự động có tất cả quyền
              </div>
            </Card>
          )}

          {/* Hướng dẫn */}
          <Card title="Lưu ý" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, lineHeight: '1.6' }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Nhân viên:</strong> Có thể truy cập hệ thống quản lý
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Khách hàng:</strong> Chỉ dùng để lưu thông tin đặt hàng
              </div>
              <div>
                <strong>Quản trị viên:</strong> Có toàn quyền truy cập
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserFormPage;