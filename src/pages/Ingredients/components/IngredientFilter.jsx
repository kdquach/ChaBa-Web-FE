import React, { useEffect, useState } from 'react';
import { Row, Col, Select, Button, Space } from 'antd';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { fetchIngredientCategories } from '../../api/ingredientCategories'; // API lấy danh mục

const { Option } = Select;

const IngredientFilter = ({ filters, onFilterChange, onReset }) => {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: undefined,
    stockStatus: undefined,
    expiryStatus: undefined,
  });

  // 🧠 Lấy danh mục nguyên liệu
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchIngredientCategories();
        setCategories(data.results || []);
      } catch (error) {
        console.error('Không thể tải danh mục nguyên liệu:', error);
      }
    };
    loadCategories();
  }, []);

  // 🧩 Xử lý thay đổi bộ lọc
  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  // 🔄 Nút Reset
  const handleReset = () => {
    const resetFilters = {
      category: undefined,
      stockStatus: undefined,
      expiryStatus: undefined,
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <Row gutter={[16, 16]} align="middle">
      <Col xs={24} sm={12} md={6}>
        <Select
          allowClear
          placeholder="Chọn danh mục"
          style={{ width: '100%' }}
          value={filters.category}
          onChange={(value) => handleChange('category', value)}
        >
          {categories.map((cat) => (
            <Option key={cat.id} value={cat.id}>
              {cat.name}
            </Option>
          ))}
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Select
          allowClear
          placeholder="Trạng thái tồn kho"
          style={{ width: '100%' }}
          value={filters.stockStatus}
          onChange={(value) => handleChange('stockStatus', value)}
        >
          <Option value="out">Hết hàng</Option>
          <Option value="low">Sắp hết hàng</Option>
          <Option value="normal">Đủ hàng</Option>
          <Option value="over">Tồn kho vượt mức</Option>
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Select
          allowClear
          placeholder="Hạn sử dụng"
          style={{ width: '100%' }}
          value={filters.expiryStatus}
          onChange={(value) => handleChange('expiryStatus', value)}
        >
          <Option value="expired">Đã hết hạn</Option>
          <Option value="nearly">Sắp hết hạn</Option>
          <Option value="valid">Còn hạn</Option>
        </Select>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Space>
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={() => onFilter(filters)}
          >
            Lọc
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset} danger>
            Đặt lại
          </Button>
        </Space>
      </Col>
    </Row>
  );
};

export default IngredientFilter;
