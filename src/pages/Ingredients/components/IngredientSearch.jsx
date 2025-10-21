import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

const IngredientSearch = ({ onSearch }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Search
        placeholder="Tìm kiếm nguyên liệu..."
        allowClear
        enterButton={<SearchOutlined />}
        size="middle"
        style={{
          width: 300,
          borderRadius: 8,
        }}
        onSearch={onSearch}
      />
    </div>
  );
};

export default IngredientSearch;
