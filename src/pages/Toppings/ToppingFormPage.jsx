import React, { useState, useEffect } from 'react';
import { Form, Input, Button, InputNumber, Upload, message, Card, Row, Col, Space } from 'antd';
import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createTopping, updateTopping, getTopping } from '../../api/toppings';

const { TextArea } = Input;

const ToppingFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (isEditing) {
      loadTopping();
    }
  }, [id, isEditing]);

  const loadTopping = async () => {
    try {
      setLoading(true);
      const topping = await getTopping(id);
      form.setFieldsValue(topping);
      
      // Set image to fileList if exists
      if (topping.image) {
        setFileList([{
          uid: '1',
          name: 'topping-image',
          status: 'done',
          url: topping.image,
        }]);
      }
    } catch (error) {
      message.error('Không thể tải thông tin topping');
      navigate('/toppings');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý upload ảnh
  const handleUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể upload file ảnh!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    return false; // Prevent auto upload
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // Xử lý image URL (giả lập - trong thực tế sẽ upload lên server)
      let imageUrl = '';
      if (fileList.length > 0) {
        if (fileList[0].url) {
          imageUrl = fileList[0].url;
        } else {
          // Mock URL cho ảnh mới upload
          imageUrl = 'https://images.pexels.com/photos/11758733/pexels-photo-11758733.jpeg?auto=compress&cs=tinysrgb&w=400';
        }
      }
      
      const toppingData = {
        ...values,
        image: imageUrl,
      };
      
      if (isEditing) {
        await updateTopping(id, toppingData);
        message.success('Cập nhật topping thành công!');
      } else {
        await createTopping(toppingData);
        message.success('Tạo topping thành công!');
      }
      
      navigate('/toppings');
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra khi lưu topping');
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
        title={isEditing ? 'Chỉnh sửa topping' : 'Thêm topping mới'}
        subtitle={isEditing ? 'Cập nhật thông tin topping' : 'Nhập thông tin topping mới'}
        showBack
        backPath="/toppings"
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
                price: 5000,
                currentStock: 50,
                minStock: 10,
                unit: 'phần',
              }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tên topping"
                    name="name"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên topping!' },
                      { max: 100, message: 'Tên topping không được vượt quá 100 ký tự!' }
                    ]}
                  >
                    <Input placeholder="Ví dụ: Trân châu đen" />
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
                    <Input placeholder="phần, gram, ml..." />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Mô tả"
                name="description"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả topping!' },
                  { max: 200, message: 'Mô tả không được vượt quá 200 ký tự!' }
                ]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Mô tả ngắn gọn về topping"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Giá bán (₫)"
                    name="price"
                    rules={[
                      { required: true, message: 'Vui lòng nhập giá bán!' },
                      { type: 'number', min: 0, message: 'Giá bán không được âm!' }
                    ]}
                    tooltip="Giá tính thêm khi khách hàng chọn topping này"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập giá bán"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      min={0}
                      addonBefore="+"
                    />
                  </Form.Item>
                </Col>
                
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
                      placeholder="Số lượng hiện có"
                      min={0}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Tồn kho tối thiểu"
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
              </Row>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => navigate('/toppings')}>
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={submitting}
                    icon={<SaveOutlined />}
                  >
                    {isEditing ? 'Cập nhật' : 'Tạo topping'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Hình ảnh topping">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUpload}
              beforeUpload={beforeUpload}
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên hình ảnh</div>
                </div>
              )}
            </Upload>
            <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
              * Chỉ hỗ trợ định dạng JPG, PNG
              <br />
              * Kích thước tối đa 2MB
            </div>
          </Card>

          <Card title="Lưu ý" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, lineHeight: '1.6' }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Giá bán:</strong> Số tiền thêm vào khi khách chọn topping
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Tồn kho:</strong> Số lượng topping hiện có
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Đơn vị:</strong> Cách tính topping (phần, gram, ml...)
              </div>
              <div>
                <strong>Cảnh báo:</strong> Hệ thống sẽ thông báo khi sắp hết hàng
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ToppingFormPage;