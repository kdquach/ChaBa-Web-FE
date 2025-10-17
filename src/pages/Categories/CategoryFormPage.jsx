import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Space, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import { createCategory, updateCategory, getCategoryById } from "../../api/categories";

const { TextArea } = Input;

const CategoryFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadCategory();
    }
  }, [id, isEditing]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const res = await getCategoryById(id);
      form.setFieldsValue({ name: res?.name, description: res?.description });
    } catch (err) {
      navigate("/categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      if (isEditing) {
        await updateCategory(id, values);
        message.success("Cập nhật danh mục thành công!");
      } else {
        await createCategory(values);
        message.success("Tạo danh mục thành công!");
      }
      navigate("/categories");
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title={isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        subtitle={isEditing ? "Cập nhật thông tin danh mục" : "Nhập thông tin danh mục"}
        showBack
        backPath="/categories"
      />

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }, { max: 100 }]}
          >
            <Input placeholder="Ví dụ: Trà, Cà phê, Sữa..." />
          </Form.Item>

          <Form.Item label="Mô tả" name="description" rules={[{ max: 300 }]}> 
            <TextArea rows={4} placeholder="Mô tả chi tiết (không bắt buộc)" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button onClick={() => navigate("/categories")}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}> 
                {isEditing ? "Cập nhật" : "Tạo danh mục"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CategoryFormPage;
