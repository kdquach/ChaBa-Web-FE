import React from 'react';
import { Alert } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

const StockAlert = ({ lowStockItems = [] }) => {
  if (lowStockItems.length === 0) return null;

  const names = lowStockItems.map((i) => i.name).join(', ');

  return (
    <Alert
      message="⚠️ Cảnh báo tồn kho"
      description={`Có ${lowStockItems.length} nguyên liệu sắp hết hàng: ${names}`}
      type="warning"
      icon={<WarningOutlined />}
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
};

export default StockAlert;
