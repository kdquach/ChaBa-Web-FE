import React, { useState, useEffect } from 'react';
import { Button, Card, message, Modal, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchIngredients, deleteIngredient } from '../../api/ingredients';
import IngredientTable from './components/IngredientTable';
import IngredientSearch from './components/IngredientSearch';
import IngredientFilter from './components/IngredientFilter';
import StockAlert from './components/StockAlert';

const { confirm } = Modal;

const IngredientListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState('');

  const loadData = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = {
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        name: (params.name ?? search) || undefined,
        categoryId: params.categoryId || undefined,
        price: params.price || undefined,
        expiryDate: params.expiryDate || undefined,
      };

      const response = await fetchIngredients(queryParams);

      setIngredients(response.results || []);
      setPagination((prev) => ({
        ...prev,
        total: response.totalResults,
        current: response.page,
      }));
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    loadData({
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  const handleSearch = (value) => {
    const trimmed = value.trim();
    setSearch(trimmed);
    setPagination((prev) => ({ ...prev, current: 1 }));

    loadData({
      page: 1,
      name: trimmed || undefined,
    });
  };

  const handleDelete = (record) => {
    confirm({
      title: 'Xác nhận xóa nguyên liệu',
      content: `Bạn có chắc chắn muốn xóa nguyên liệu "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteIngredient(record.id);
          message.success('Xóa nguyên liệu thành công');
          loadData();
        } catch (error) {
          message.error('Không thể xóa nguyên liệu');
        }
      },
    });
  };

  const lowStockItems = ingredients.filter(
    (i) => i.minStock !== undefined && i.stock < i.minStock
  );

  const headerExtra = (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate('/ingredients/new')}
    >
      Thêm nguyên liệu
    </Button>
  );

  if (loading && ingredients.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Quản lý nguyên liệu"
        subtitle="Theo dõi tồn kho và danh mục nguyên liệu"
        extra={headerExtra}
      />
      <StockAlert lowStockItems={lowStockItems} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginBottom: 16,
          gap: 8,
        }}
      >
        <IngredientSearch onSearch={handleSearch} />
        <IngredientFilter
          onFilter={(filters) => {
            const params = {
              page: 1,
              name: search || undefined,
              categoryId: filters.categoryId || undefined,
              price: filters.price || undefined,
              expiryDate: filters.expiryDate
                ? filters.expiryDate.format('YYYY-MM-DD')
                : undefined,
            };
            loadData(params);
          }}
        />
      </div>

      <Card>
        <IngredientTable
          data={ingredients}
          loading={loading}
          pagination={pagination}
          onTableChange={handleTableChange}
          onDelete={handleDelete}
        />
      </Card>
    </div>
  );
};

export default IngredientListPage;
