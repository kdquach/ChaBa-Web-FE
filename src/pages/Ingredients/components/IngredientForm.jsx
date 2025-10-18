import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Space,
  Card,
  Select,
} from 'antd';
import { fetchIngredientCategoryNames } from '../../../api/ingredientCategories';
import { SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const IngredientForm = ({
  form,
  isEditing,
  onSubmit,
  submitting,
  initialValues,
  isView = false,
}) => {
  const navigate = useNavigate();
  const [ingredientNames, setIngredientNames] = useState([]);

  useEffect(() => {
    const loadNames = async () => {
      const data = await fetchIngredientCategoryNames();
      setIngredientNames(data);
    };
    loadNames();
  }, []);

  return (
    <Card title="Thông tin cơ bản">
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        autoComplete="off"
        initialValues={initialValues}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Tên nguyên liệu"
              name="name"
              rules={[
                { required: true, message: 'Vui lòng nhập tên nguyên liệu!' },
                { max: 100, message: 'Tên không được vượt quá 100 ký tự!' },
              ]}
            >
              <Input placeholder="Nhập tên nguyên liệu" disabled={isView} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Đơn vị tính"
              name="unit"
              rules={[
                { required: true, message: 'Vui lòng nhập đơn vị tính!' },
              ]}
            >
              <Input placeholder="kg, lít, gói, thùng..." disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { required: false, message: 'Vui lòng nhập mô tả nguyên liệu!' }, // Không bắt buộc theo BE
            { max: 500, message: 'Mô tả không được vượt quá 500 ký tự!' },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Nhập mô tả chi tiết về nguyên liệu (không bắt buộc)"
            disabled={isView}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Tồn kho"
              name="stock" // ✅ Đổi từ currentStock → stock (theo BE)
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng tồn kho!' },
                { type: 'number', min: 0, message: 'Tồn kho không được âm!' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập số lượng"
                min={0}
                disabled={isView}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item
              label="Tồn kho tối thiểu"
              name="minStock"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mức tồn kho tối thiểu!',
                },
                { type: 'number', min: 0, message: 'Giá trị không được âm!' },
              ]}
              tooltip="Hệ thống sẽ cảnh báo khi tồn kho xuống dưới mức này"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Mức cảnh báo"
                min={0}
                disabled={isView}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item
              label="Tồn kho tối đa"
              name="maxStock"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mức tồn kho tối đa!',
                },
                {
                  type: 'number',
                  min: 1,
                  message: 'Mức tối đa phải lớn hơn 0!',
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Mức tối đa"
                min={1}
                disabled={isView}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Giá (₫)"
              name="price" // ✅ Đổi từ pricePerUnit → price (theo BE)
              rules={[
                { required: true, message: 'Vui lòng nhập giá!' },
                { type: 'number', min: 0, message: 'Giá không được âm!' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập giá"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                min={0}
                disabled={isView}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Hạn sử dụng"
              name="expiryDate"
              rules={[
                { required: true, message: 'Vui lòng chọn hạn sử dụng!' }, // Không bắt buộc theo BE
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Chọn ngày hết hạn (không bắt buộc)"
                format="DD/MM/YYYY"
                disabled={isView}
                disabledDate={(current) =>
                  current && current < dayjs().startOf('day')
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Nhà cung cấp"
              name="supplier"
              rules={[
                { required: false, message: 'Vui lòng nhập tên nhà cung cấp!' }, // Không bắt buộc theo BE
                {
                  max: 200,
                  message: 'Tên nhà cung cấp không được vượt quá 200 ký tự!',
                },
              ]}
            >
              <Input
                placeholder="Nhập tên nhà cung cấp (không bắt buộc)"
                disabled={isView}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Danh mục nguyên liệu"
              name="categoryId"
              // rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Select
                placeholder="Chọn danh mục nguyên liệu"
                allowClear
                disabled={isView}
              >
                {ingredientNames.map((item) => (
                  <Option key={item._id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button danger onClick={() => navigate('/ingredients')}>
              Hủy
            </Button>
            {!isView && (
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<SaveOutlined />}
              >
                {isEditing ? 'Cập nhật' : 'Tạo nguyên liệu'}
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default IngredientForm;
