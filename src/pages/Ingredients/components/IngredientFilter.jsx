// import React, { useEffect, useState } from 'react';
// import { Row, Col, Select, DatePicker, InputNumber, Button, Space } from 'antd';
// import { fetchIngredientCategoryNames } from '../../../api/ingredientCategories';
// import dayjs from 'dayjs';

// const { Option } = Select;

// const IngredientFilter = ({ onFilter }) => {
//   const [categories, setCategories] = useState([]);
//   const [filters, setFilters] = useState({
//     expiryDate: null,
//     categoryId: null,
//     price: null,
//   });

//   useEffect(() => {
//     const loadCategories = async () => {
//       const data = await fetchIngredientCategoryNames();
//       setCategories(data);
//     };
//     loadCategories();
//   }, []);

//   const handleChange = (changedValues) => {
//     setFilters((prev) => ({ ...prev, ...changedValues }));
//   };

//   const handleApply = () => {
//     onFilter(filters);
//   };

//   const handleReset = () => {
//     setFilters({
//       expiryDate: null,
//       categoryId: null,
//       price: null,
//     });
//     onFilter({});
//   };

//   return (
//     <div style={{ marginBottom: 16 }}>
//       <Row gutter={16} align="middle">
//         {/* Hạn sử dụng */}
//         <Col xs={24} sm={8} md={6}>
//           <DatePicker
//             style={{ width: '100%' }}
//             format="DD/MM/YYYY"
//             placeholder="Chọn hạn sử dụng"
//             value={filters.expiryDate}
//             onChange={(date) => handleChange({ expiryDate: date })}
//             disabledDate={(current) =>
//               current && current < dayjs().startOf('day')
//             }
//           />
//         </Col>

//         {/* Danh mục */}
//         <Col xs={24} sm={8} md={6}>
//           <Select
//             allowClear
//             placeholder="Chọn danh mục"
//             style={{ width: '100%' }}
//             value={filters.categoryId}
//             onChange={(value) => handleChange({ categoryId: value })}
//           >
//             {categories.map((item) => (
//               <Option key={item._id} value={item.id}>
//                 {item.name}
//               </Option>
//             ))}
//           </Select>
//         </Col>

//         {/* Giá (lọc theo nhỏ hơn hoặc bằng) */}
//         <Col xs={24} sm={8} md={6}>
//           <InputNumber
//             placeholder="Nhập giá tối đa"
//             min={0}
//             style={{ width: '100%' }}
//             value={filters.price}
//             onChange={(value) => handleChange({ price: value })}
//           />
//         </Col>

//         {/* Nút hành động */}
//         <Col xs={24} sm={24} md={4}>
//           <Space>
//             <Button type="primary" onClick={handleApply}>
//               Lọc
//             </Button>
//             <Button onClick={handleReset}>Đặt lại</Button>
//           </Space>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default IngredientFilter;
import React, { useEffect, useState } from 'react';
import { Row, Col, Select, DatePicker, InputNumber, Button, Space } from 'antd';
import { fetchIngredientCategoryNames } from '../../../api/ingredientCategories';
import dayjs from 'dayjs';

const { Option } = Select;

const IngredientFilter = ({ onFilter }) => {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    expiryDate: null,
    categoryId: null,
    price: null,
  });

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchIngredientCategoryNames();
      setCategories(data);
    };
    loadCategories();
  }, []);

  const handleChange = (changedValues) => {
    setFilters((prev) => ({ ...prev, ...changedValues }));
  };

  const handleApply = () => onFilter(filters);

  const handleReset = () => {
    const reset = { expiryDate: null, categoryId: null, price: null };
    setFilters(reset);
    onFilter({});
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      {/* Hạn sử dụng */}
      <DatePicker
        format="DD/MM/YYYY"
        placeholder="Hạn sử dụng"
        value={filters.expiryDate}
        onChange={(date) => handleChange({ expiryDate: date })}
        disabledDate={(current) => current && current < dayjs().startOf('day')}
        style={{ width: 250 }}
      />

      {/* Danh mục */}
      <Select
        allowClear
        placeholder="Danh mục"
        style={{ width: 250 }}
        value={filters.categoryId}
        onChange={(value) => handleChange({ categoryId: value })}
      >
        {categories.map((item) => (
          <Option key={item._id} value={item.id}>
            {item.name}
          </Option>
        ))}
      </Select>

      {/* Giá */}
      <InputNumber
        placeholder="Giá tối đa"
        min={0}
        style={{ width: 250 }}
        value={filters.price}
        onChange={(value) => handleChange({ price: value })}
      />

      {/* Nút hành động */}
      <Space>
        <Button type="primary" onClick={handleApply}>
          Lọc
        </Button>
        <Button onClick={handleReset}>Đặt lại</Button>
      </Space>
    </div>
  );
};

export default IngredientFilter;
