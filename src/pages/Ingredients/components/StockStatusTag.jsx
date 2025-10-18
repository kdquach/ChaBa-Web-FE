import React from 'react';
import { Tag } from 'antd';

const StockStatusTag = ({ stock, minStock, maxStock }) => {
  let color = 'green';
  let text = 'Đủ hàng';

  if (stock <= 0) {
    color = 'red';
    text = 'Hết hàng';
  } else if (stock < minStock) {
    color = 'orange';
    text = 'Sắp hết hàng';
  } else if (stock > maxStock) {
    color = 'blue';
    text = 'Tồn kho vượt mức';
  }

  return <Tag color={color}>{`${stock} (${text})`}</Tag>;
};

export default StockStatusTag;
