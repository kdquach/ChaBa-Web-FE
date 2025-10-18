import React from 'react';
import { Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';

const ExpiryStatusTag = ({ expiryDate }) => {
  if (!expiryDate) return <Tag color="default">—</Tag>;

  const today = dayjs();
  const expiry = dayjs(expiryDate);
  const diffDays = expiry.diff(today, 'day');

  let color = 'default';
  let text = expiry.format('DD/MM/YYYY');

  if (diffDays < 0) {
    color = 'red';
    text = 'Đã hết hạn';
  } else if (diffDays <= 7) {
    color = 'orange';
    text = `Sắp hết hạn (${diffDays} ngày)`;
  } else if (diffDays <= 30) {
    color = 'gold';
    text = `Còn ${diffDays} ngày`;
  }

  return (
    <Tooltip title={`Hạn: ${expiry.format('DD/MM/YYYY')}`}>
      <Tag color={color}>{text}</Tag>
    </Tooltip>
  );
};

export default ExpiryStatusTag;
