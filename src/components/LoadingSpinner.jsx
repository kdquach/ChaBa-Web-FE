import React from 'react';
import { Spin } from 'antd';

const LoadingSpinner = ({ tip = "Đang tải...", size = "default" }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
      width: '100%'
    }}>
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default LoadingSpinner;