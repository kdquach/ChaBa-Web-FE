import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Switch, message, Card, Row, Col, Checkbox, Space, Alert } from 'antd';
import { SaveOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createUser, updateUser, getUser } from '../../api/users';
import { PERMISSIONS } from '../../utils/auth';
import AddressForm from '../../components/AddressForm';

const { Option } = Select;
const { TextArea } = Input;

const UserFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false)
  const [userType, setUserType] = useState('user')
  const [address, setAddress] = useState({})
  const [addressDisabled, setAddressDisabled] = useState(false);
  const [permissions, setPermissions] = useState([]);

  // Centralized permission options for reuse
  const permissionOptions = [
    { label: 'Quản lý sản phẩm', value: PERMISSIONS.MANAGE_PRODUCTS },
    { label: 'Quản lý đơn hàng', value: PERMISSIONS.MANAGE_ORDERS },
    { label: 'Quản lý người dùng', value: PERMISSIONS.MANAGE_USERS },
    { label: 'Quản lý nguyên liệu', value: PERMISSIONS.MANAGE_INGREDIENTS },
    { label: 'Quản lý topping', value: PERMISSIONS.MANAGE_TOPPINGS },
    { label: 'Xem báo cáo', value: PERMISSIONS.VIEW_REPORTS },
  ];

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
      setAddress(user.addresses?.[0] || {});
      setPermissions(user.permissions || []);
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
        permissions: permissions.length > 0 ? permissions : ['manage_products', 'manage_orders']
      });
    }
  };

  const handleAddressChange = (newAddress) => {
    setAddress(newAddress);
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      if (userType === 'user' && addressDisabled) {
        delete values.addresses;
      } else if (userType === 'user' && !addressDisabled && Object.keys(address).length === 0) {
        message.error("Vui lòng nhập địa chỉ hoặc bỏ chọn cập nhật địa chỉ");
        setSubmitting(false);
        return;
      }
      // Chuẩn hóa payload gửi BE: đảm bảo addresses là mảng và bỏ các field không cần thiết
      const userData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        status: values.status ? 'active' : 'inactive',
      };
      if (userType === 'staff') {
        userData.permissions = values.permissions || [];
      }
      if (userType === 'user' && !addressDisabled) {
        // đảm bảo là mảng 1 phần tử
        userData.addresses = Array.isArray(values.addresses)
          ? values.addresses
          : [address];
      }

      if (isEditing) {
        await updateUser(id, userData);
        message.success('Cập nhật người dùng thành công!');
      } else {
        await createUser(userData);
        message.success('Tạo người dùng thành công!');
        navigate('/users');
      }

    } catch (error) {
      const keyError = error?.response?.data?.message.split(':');
      if (keyError && keyError[2].includes('invalid')) {
        message.error(`${keyError[1].toUpperCase()} không hợp lệ!`);
      } else if (keyError && keyError[2].includes('required')) {
        message.error(`Vui lòng điền đầy đủ thông tin ${keyError[1].split('.')[0].toUpperCase()}!`);
      }
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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
        <Card>
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
            <Row gutter={24}>
              <Col xs={24} lg={16}>

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

                </Row>

                <Row gutter={16}>

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

                  <Col xs={24} sm={12}>
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
                </Row>

                {/* Chỉ hiện địa chỉ cho customer */}
                {userType === 'user' && (
                  <Form.Item name="addresses"
                    label={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ marginRight: '20px' }}>Địa chỉ</span>
                        <Switch
                          size="small"
                          checked={addressDisabled}
                          onChange={(checked) => setAddressDisabled(!!checked)}
                          checkedChildren="Cập nhật địa chỉ"
                          unCheckedChildren="Bỏ qua địa chỉ"
                        />
                      </div>
                    }>
                    <AddressForm
                      value={address}
                      onChange={handleAddressChange}
                      disabled={addressDisabled}
                    />
                  </Form.Item>
                )}

                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Vai trò"
                      name="role"
                      rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                      <Select placeholder="Chọn vai trò">
                        {userType === 'staff' ? (
                          <>
                            <Option value="admin" selected={userType === 'admin'}>Quản trị viên</Option>
                            <Option value="staff" selected={userType === 'staff'}>Nhân viên</Option>
                          </>
                        ) :
                          <Option value="user" selected={userType === 'user'}>Khách hàng</Option>
                        }
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
              </Col>
              <Col xs={24} lg={8}>
                {userType === 'staff' && (
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Phân quyền</div>
                    <Form.Item name="permissions" label={null}>
                      <Checkbox.Group options={permissionOptions} />
                    </Form.Item>
                    <div style={{ fontSize: 12, color: '#888' }}>* Quản trị viên sẽ tự động có tất cả quyền</div>
                  </div>
                )}
                <Alert
                  style={{ marginTop: 16 }}
                  type="info"
                  showIcon
                  message="Lưu ý"
                  description={
                    <div>
                      <div><strong>Nhân viên:</strong> Có thể truy cập hệ thống quản lý</div>
                      <div><strong>Khách hàng:</strong> Chỉ dùng để lưu thông tin đặt hàng</div>
                      <div><strong>Quản trị viên:</strong> Có toàn quyền truy cập</div>
                    </div>
                  }
                />
              </Col>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Button onClick={() => navigate('/users')}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>{isEditing ? 'Cập nhật' : 'Tạo người dùng'}</Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>

  );
};


export default UserFormPage;