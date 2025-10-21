import React, { useState, useEffect } from 'react';
import { Form, message, Row, Col } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  createIngredient,
  updateIngredient,
  fetchIngredientById,
} from '../../api/ingredients';
import IngredientForm from './components/IngredientForm';
import IngredientFormSidebar from './components/IngredientFormSidebar';

const IngredientFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // ✅ Xác định chế độ
  const isEditing = location.pathname.includes('/edit');
  const isView = location.pathname.includes('/view');
  const isCreating = !id && !isEditing && !isView;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialFormValues = {
    stock: 0,
    minStock: 100,
    maxStock: 1000,
    price: 0,
    // unit: 'kg',
  };

  useEffect(() => {
    if (isEditing || isView) {
      loadIngredient();
    }
  }, [id, isEditing, isView]);

  const loadIngredient = async () => {
    try {
      setLoading(true);
      const ingredient = await fetchIngredientById(id);
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

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      const ingredientData = {
        ...values,
        expiryDate: values.expiryDate
          ? values.expiryDate.format('YYYY-MM-DD')
          : undefined,
        description: values.description || undefined,
        supplier: values.supplier || undefined,
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
        title={
          isView
            ? 'Xem chi tiết nguyên liệu'
            : isEditing
            ? 'Chỉnh sửa nguyên liệu'
            : 'Thêm nguyên liệu mới'
        }
        subtitle={
          isView
            ? 'Thông tin chi tiết của nguyên liệu'
            : isEditing
            ? 'Cập nhật thông tin nguyên liệu'
            : 'Nhập thông tin nguyên liệu mới'
        }
        showBack
        backPath="/ingredients"
      />

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <IngredientForm
            form={form}
            isView={isView}
            isEditing={isEditing}
            onSubmit={handleSubmit}
            submitting={submitting}
            initialValues={initialFormValues}
          />
        </Col>

        <Col xs={24} lg={8}>
          <IngredientFormSidebar />
        </Col>
      </Row>
    </div>
  );
};

export default IngredientFormPage;
