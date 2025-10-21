import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Row, Col, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  createIngredientCategory,
  updateIngredientCategory,
  fetchIngredientCategoryById,
} from '../../api/ingredientCategories';

const IngredientCategoryFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // ✅ Xác định chế độ hiện tại
  const isEditing = location.pathname.includes('/edit');
  const isCreating = !id && !isEditing;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Tải dữ liệu khi đang edit
  useEffect(() => {
    if (isEditing) {
      loadCategory();
    }
  }, [id, isEditing]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const category = await fetchIngredientCategoryById(id);

      form.setFieldsValue({
        name: category.name,
        description: category.description,
      });
    } catch (error) {
      console.error(error);
      message.error('Không thể tải thông tin loại nguyên liệu');
      navigate('/ingredient-categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const categoryData = { ...values };

      if (isEditing) {
        await updateIngredientCategory(id, categoryData);
        message.success('Cập nhật loại nguyên liệu thành công!');
      } else {
        await createIngredientCategory(categoryData);
        message.success('Tạo loại nguyên liệu thành công!');
      }

      navigate('/ingredient-categories');
    } catch (error) {
      console.error(error);
      message.error(error.message || 'Có lỗi xảy ra khi lưu loại nguyên liệu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title={
          isEditing ? 'Chỉnh sửa loại nguyên liệu' : 'Thêm loại nguyên liệu mới'
        }
        subtitle={
          isEditing
            ? 'Cập nhật thông tin loại nguyên liệu'
            : 'Nhập thông tin loại nguyên liệu mới'
        }
        showBack
        backPath="/ingredient-categories"
      />

      <Row gutter={24}>
        {/* Cột trái: form */}
        <Col xs={24} lg={12}>
          <Card title="Thông tin cơ bản">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="Tên loại nguyên liệu"
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên loại nguyên liệu!',
                  },
                ]}
              >
                <Input placeholder="Nhập tên loại nguyên liệu" />
              </Form.Item>

              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={3} placeholder="Nhập mô tả (nếu có)" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button
                    danger
                    onClick={() => navigate('/ingredient-categories')}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    icon={<SaveOutlined />}
                  >
                    {isEditing ? 'Cập nhật' : 'Tạo mới'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Cột phải: hướng dẫn */}
        <Col xs={24} lg={12}>
          <Card
            title="📘 Hướng dẫn nhập liệu"
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              height: '100%',
              borderRadius: 12,
            }}
          >
            <div style={{ lineHeight: 1.8, color: '#444', fontSize: '15px' }}>
              <p>
                <strong>🧾 Tên loại nguyên liệu:</strong> Nên đặt ngắn gọn, dễ
                hiểu, phản ánh đúng nhóm.
              </p>
              <p>
                <strong>💡 Ví dụ:</strong> “Trà”, “Đường”, “Sữa”, “Trái cây
                tươi”.
              </p>
              <p>
                <strong>🗒️ Mô tả:</strong> Ghi chú giúp phân biệt rõ hơn khi có
                nhiều loại tương tự.
              </p>
              <p>
                <strong>⚠️ Lưu ý:</strong> Không nhập trùng tên loại nguyên liệu
                đã tồn tại.
              </p>
              <p style={{ color: '#1890ff', marginTop: '1rem' }}>
                Sau khi lưu, bạn có thể quản lý chi tiết trong trang danh sách.
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IngredientCategoryFormPage;
