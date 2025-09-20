import React, { useState, useEffect } from 'react';
import { Form, Input, Button, InputNumber, DatePicker, message, Card, Row, Col, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createIngredient, updateIngredient, getIngredient } from '../../api/ingredients';

const { TextArea } = Input;

const IngredientFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadIngredient();
    }
  }, [id, isEditing]);

  const loadIngredient = async () => {
    try {
      setLoading(true);
      const ingredient = await getIngredient(id);
      form.setFieldsValue({
        ...ingredient,
        expiryDate: ingredient.expiryDate ? dayjs(ingredient.expiryDate) : null,
      });
    } catch (error) {
      message.error('Không thể tải thông tin nguyên liệu');
      navigate('/ingredients');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const ingredientData = {
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : null,
      };
      
      if (isEditing) {
        await updateIngredient(id, ingredientData);
        message.success('Cập nhật nguyên liệu thành công!');
      } else {
        await createIngredient(ingredientData);
        message.success('Tạo nguyên liệu thành công!');
      }
      
      navigate('/ingredients');
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra khi lưu nguyên liệu');
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
        title={isEditing ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
        subtitle={isEditing ? 'Cập nhật thông tin nguyên liệu' : 'Nhập thông tin nguyên liệu mới'}
        showBack
        backPath="/ingredients"
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
                currentStock: 0,
                minStock: 5,
                maxStock: 100,
                pricePerUnit: 0,
                unit: 'kg',
              }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tên nguyên liệu"
                    name="name"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên nguyên liệu!' },
                      { max: 100, message: 'Tên không được vượt quá 100 ký tự!' }
                    ]}
                  >
                    <Input placeholder="Nhập tên nguyên liệu" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Đơn vị tính"
                    name="unit"
                    rules={[
                      { required: true, message: 'Vui lòng nhập đơn vị tính!' }
                    ]}
                  >
                    <Input placeholder="kg, lít, gói, thùng..." />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Mô tả"
                name="description"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả nguyên liệu!' },
                  { max: 500, message: 'Mô tả không được vượt quá 500 ký tự!' }
                ]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Nhập mô tả chi tiết về nguyên liệu"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Tồn kho hiện tại"
                    name="currentStock"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số lượng tồn kho!' },
                      { type: 'number', min: 0, message: 'Tồn kho không được âm!' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập số lượng"
                      min={0}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Mức tồn kho tối thiểu"
                    name="minStock"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mức tồn kho tối thiểu!' },
                      { type: 'number', min: 0, message: 'Giá trị không được âm!' }
                    ]}
                    tooltip="Hệ thống sẽ cảnh báo khi tồn kho xuống dưới mức này"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Mức cảnh báo"
                      min={0}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Mức tồn kho tối đa"
                    name="maxStock"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mức tồn kho tối đa!' },
                      { type: 'number', min: 1, message: 'Mức tối đa phải lớn hơn 0!' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Mức tối đa"
                      min={1}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Giá mua (₫)"
                    name="pricePerUnit"
                    rules={[
                      { required: true, message: 'Vui lòng nhập giá mua!' },
                      { type: 'number', min: 0, message: 'Giá mua không được âm!' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập giá mua"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Hạn sử dụng"
                    name="expiryDate"
                    rules={[
                      { required: true, message: 'Vui lòng chọn hạn sử dụng!' }
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="Chọn ngày hết hạn"
                      format="DD/MM/YYYY"
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Nhà cung cấp"
                name="supplier"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên nhà cung cấp!' },
                  { max: 200, message: 'Tên nhà cung cấp không được vượt quá 200 ký tự!' }
                ]}
              >
                <Input placeholder="Nhập tên nhà cung cấp" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => navigate('/ingredients')}>
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={submitting}
                    icon={<SaveOutlined />}
                  >
                    {isEditing ? 'Cập nhật' : 'Tạo nguyên liệu'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Hướng dẫn">
            <div style={{ fontSize: 13, lineHeight: '1.6' }}>
              <div style={{ marginBottom: 12 }}>
                <strong>Tồn kho tối thiểu:</strong> Mức cảnh báo khi nguyên liệu sắp hết
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Tồn kho tối đa:</strong> Mức tối đa nên nhập kho
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Hạn sử dụng:</strong> Ngày hết hạn của lô hàng hiện tại
              </div>
              <div>
                <strong>Giá mua:</strong> Giá nhập nguyên liệu cho việc tính toán chi phí
              </div>
            </div>
          </Card>
          
          <Card title="Đơn vị tính phổ biến" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, lineHeight: '1.8' }}>
              <div>• <strong>kg:</strong> Kilogram (trà, đường, bột...)</div>
              <div>• <strong>lít:</strong> Lít (sữa, nước...)</div>
              <div>• <strong>gói:</strong> Gói (gia vị, trân châu...)</div>
              <div>• <strong>thùng:</strong> Thùng (chai, lon...)</div>
              <div>• <strong>hộp:</strong> Hộp đóng gói</div>
              <div>• <strong>cái:</strong> Đếm từng cái</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IngredientFormPage;