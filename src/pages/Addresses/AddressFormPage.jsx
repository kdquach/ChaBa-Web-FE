import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Select, Switch, Row, Col } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { createAddress, getAddressById, updateAddress } from '../../api/addresses';
import { getUsers } from '../../api/users';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const AddressFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [loadedAddress, setLoadedAddress] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // --- Load danh sách tỉnh
  useEffect(() => {
    axios.get('https://provinces.open-api.vn/api/?depth=1').then((res) => setCities(res.data || []));
  }, []);

  // --- Load users
  useEffect(() => {
    (async () => {
      try {
        const res = await getUsers({ limit: 100, page: 1 });
        const list = res?.data || res;
        setUsers(list || []);
      } catch (e) {
        console.error('Error loading users', e);
      }
    })();
  }, []);

  // --- Helpers
  const findCityByName = (name) => cities.find((c) => c.name === name);
  const findDistrictByName = (name) => districts.find((d) => d.name === name);

  const loadDistrictsByCityName = async (cityName) => {
    const c = findCityByName(cityName);
    if (!c?.code) {
      setDistricts([]);
      return;
    }
    const res = await axios.get(`https://provinces.open-api.vn/api/p/${c.code}?depth=2`);
    setDistricts(res.data?.districts || []);
  };

  const loadWardsByDistrictName = async (districtName) => {
    const d = findDistrictByName(districtName);
    if (!d?.code) {
      setWards([]);
      return;
    }
    const res = await axios.get(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`);
    setWards(res.data?.wards || []);
  };

  // --- Khi chọn tỉnh thì load quận
  const handleCityChange = async (cityName) => {
    form.setFieldsValue({ district: undefined, ward: undefined });
    setDistricts([]);
    setWards([]);
    await loadDistrictsByCityName(cityName);
  };

  // --- Khi chọn quận thì load phường
  const handleDistrictChange = async (districtName) => {
    form.setFieldsValue({ ward: undefined });
    setWards([]);
    await loadWardsByDistrictName(districtName);
  };

  // --- Khi chọn người nhận thì tự điền SĐT
  const handleRecipientChange = (userId) => {
    const selectedUser = users.find((u) => (u.id || u._id) === userId);
    if (selectedUser?.phone) {
      form.setFieldsValue({ phone: selectedUser.phone });
    }
  };

  // --- Load data khi sửa
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getAddressById(id);
        const normalized = { ...data };
        if (isAdmin && data?.user && typeof data.user === 'object') {
          normalized.user = data.user.id || data.user._id;
        }
        setLoadedAddress(normalized);
        form.setFieldsValue(normalized);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, form]);

  // --- Populate dependent selects khi edit
  useEffect(() => {
    const bootstrap = async () => {
      if (!loadedAddress || !cities.length) return;
      if (loadedAddress.city) await loadDistrictsByCityName(loadedAddress.city);
      if (loadedAddress.district) await loadWardsByDistrictName(loadedAddress.district);
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedAddress, cities]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateAddress(id, values);
        // Return to previous list if navigated from it; otherwise go to /addresses
        if (location.state && location.state.fromList) {
          navigate(-1);
        } else {
          navigate('/addresses');
        }
      } else {
        await createAddress(values);
        const redirect = isAdmin && values.user ? `/addresses?userId=${values.user}` : '/addresses';
        navigate(redirect);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ'} />
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ country: 'VN', isDefault: false }}
          autoComplete="off"
        >
          {/* --- Người nhận (chọn tên -> tự điền SĐT) */}
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                label="Người dùng"
                name="user"
                rules={[{ required: true, message: 'Chọn người dùng' }]}
              >
                <Select
                  placeholder="Chọn người dùng"
                  onChange={handleRecipientChange}
                  showSearch
                  optionFilterProp="label"
                  autoComplete="off"
                  disabled={isEdit}
                  options={users.map((u) => ({
                    value: u.id || u._id,
                    label: u.name || u.username,
                    phone: u.phone,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: 'Vui lòng nhập SĐT' },
                  { pattern: /^[0-9]+$/, message: 'Chỉ được nhập số' },
                ]}
              >
                <Input placeholder="0901234567" autoComplete="off" />
              </Form.Item>
            </Col>
          </Row>

          {/* --- Thành phố / Quận / Phường */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Tỉnh/Thành phố" name="city" rules={[{ required: true }]}>
                <Select
                  placeholder="Chọn tỉnh/thành phố"
                  onChange={handleCityChange}
                  optionFilterProp="label"
                  options={cities.map((c) => ({ value: c.name, label: c.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Quận/Huyện" name="district" rules={[{ required: true }]}>
                <Select
                  placeholder="Chọn quận/huyện"
                  onChange={handleDistrictChange}
                  optionFilterProp="label"
                  options={districts.map((d) => ({ value: d.name, label: d.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Phường/Xã" name="ward" rules={[{ required: true }]}>
                <Select
                  placeholder="Chọn phường/xã"
                  optionFilterProp="label"
                  options={wards.map((w) => ({ value: w.name, label: w.name }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* --- Địa chỉ & Quốc gia */}
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item label="Địa chỉ" name="addressLine" rules={[{ required: true }]}>
                <Input placeholder="Số nhà, khóm, đường..." autoComplete="off" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Quốc gia" name="country">
                <Input maxLength={2} placeholder="VN" autoComplete="off" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={3} autoComplete="off" />
          </Form.Item>

          <Form.Item label="Đặt làm địa chỉ mặc định" name="isDefault" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/addresses')}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddressFormPage;
