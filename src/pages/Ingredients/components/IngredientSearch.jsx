import React from 'react';
import { Input, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

const IngredientSearch = ({ onSearch, style }) => {
  return (
    <Card style={{ marginBottom: 16, ...style }}>
      <Search
        placeholder="Tìm kiếm nguyên liệu..."
        allowClear
        enterButton={<SearchOutlined />}
        size="middle"
        style={{ width: 300 }}
        onSearch={onSearch}
      />
    </Card>
  );
};

export default IngredientSearch;
