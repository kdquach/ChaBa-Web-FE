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
  const [role, setRole] = useState('user');

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
    } else {
      form.resetFields();
      setRole('user');
      setUserType('user');
      setPermissions([]);
      setAddress({});
      setAddressDisabled(false);
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
      setRole(user.role);
      console.log(role);
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
      setRole(type);
      form.setFieldsValue({
        role: type,
        permissions: []
      });
      setPermissions([]);
    } else if (type === 'staff') {
      form.setFieldsValue({
        role: type || 'staff',
        permissions: [
          PERMISSIONS.MANAGE_PRODUCTS,
          PERMISSIONS.MANAGE_ORDERS,
        ]
      });
      setRole(type || 'staff');
    }

  };

  // Khi chọn role là admin thì tự động gán tất cả permissions và type='staff'
  const handleRoleChange = (value) => {
    setRole(value);
    if (userType === 'staff' && value === 'admin') {
      const allPerms = permissionOptions.map((p) => p.value);
      setPermissions(allPerms);
      form.setFieldsValue({ permissions: allPerms });
    } else {
      setPermissions([PERMISSIONS.MANAGE_PRODUCTS, PERMISSIONS.MANAGE_ORDERS]);
      form.setFieldsValue({ permissions: [PERMISSIONS.MANAGE_PRODUCTS, PERMISSIONS.MANAGE_ORDERS] });
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
        type: values.type
      };
      if (userType === 'staff' && values.role === 'admin') {
        userData.permissions = permissionOptions.map(p => p.value);
      } else if (userType === 'staff') {
        userData.permissions = values.permissions || [];
      }

      if (userType === 'user' && !addressDisabled) {

        const rawAddresses = Array.isArray(values.addresses)
          ? values.addresses
          : [address];

        const addr = rawAddresses[0] || {};

        if (
          !addr.street?.trim() ||
          !addr.city?.code ||
          !addr.district?.code ||
          !addr.ward?.code
        ) {
          // Nếu thiếu bất kỳ phần nào → báo lỗi đẹp
          throw new Error('Vui lòng điền đầy đủ địa chỉ');
        }

        // ✅ Nếu hợp lệ thì format trước khi gửi
        userData.addresses = formatAddresses(addr);

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
      // ✅ Nếu là lỗi custom (do bạn throw)
      if (!error.response) {
        return message.error(error.message);
      }

      // ✅ Nếu là lỗi từ backend có message
      const serverMessage = error.response?.data?.message;
      const keyError = serverMessage ? serverMessage.split(':') : null;

      if (keyError && keyError[2]?.includes('Invalid')) {
        message.error(`${keyError[1].toUpperCase()} không hợp lệ!`);
      } else if (keyError && keyError[2]?.includes('required')) {
        message.error(`Vui lòng điền đầy đủ thông tin ${keyError[1].split('.')[0].toUpperCase()}!`);
      } else {
        message.error(serverMessage || "Đã có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatAddresses = (addresses) => {
    if (!addresses) return [];

    return addresses.map((addr) => ({
      street: addr.street,
      city: {
        code: addr.city?.code,
        name: addr.city?.name,
      },
      district: {
        code: addr.district?.code,
        name: addr.district?.name,
      },
      ward: {
        code: addr.ward?.code,
        name: addr.ward?.name,
      },
    }));
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
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
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
                      <Select placeholder="Chọn vai trò" value={role} onChange={handleRoleChange}>
                        {userType === 'staff' ? (
                          <>
                            <Option value="admin" >Quản trị viên</Option>
                            <Option value="staff">Nhân viên</Option>
                          </>
                        ) :
                          <Option value="user">Khách hàng</Option>
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
                      <Checkbox.Group
                        options={permissionOptions}
                        value={permissions}
                        onChange={(vals) => setPermissions(vals)}
                      />
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
                    <div style={{ fontSize: 13 }}>
                      <div><strong>Nhân viên:</strong> Có thể truy cập hệ thống quản lý</div>
                      <div><strong>Khách hàng:</strong> Chỉ dùng để lưu thông tin đặt hàng</div>
                      <div><strong>Quản trị viên:</strong> Có toàn quyền truy cập</div>
                      {!isEditing && (
                        <div style={{ fontSize: 12, color: '#888', marginTop: 10 }}>
                          <span style={{ fontStyle: 'italic' }}>* <strong>Mật khẩu mặc định sau khi tạo sẽ dựa theo vai trò bạn chọn. Ví dụ:</strong> <p style={{ color: 'red' }}>{role}12345</p></span>
                        </div>
                      )}
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