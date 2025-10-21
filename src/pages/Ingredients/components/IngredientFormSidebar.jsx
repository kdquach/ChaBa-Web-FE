import React from 'react';
import { Card } from 'antd';

const IngredientFormSidebar = () => {
  return (
    <>
      <Card title="Hướng dẫn">
        <div style={{ fontSize: 13, lineHeight: '1.6' }}>
          <div style={{ marginBottom: 12 }}>
            <strong>Tồn kho tối thiểu:</strong> Mức cảnh báo khi nguyên liệu sắp
            hết
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>Tồn kho tối đa:</strong> Mức tối đa nên nhập kho
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>Hạn sử dụng:</strong> Ngày hết hạn của lô hàng hiện tại
          </div>
          <div>
            <strong>Giá mua:</strong> Giá nhập nguyên liệu cho việc tính toán
            chi phí
          </div>
        </div>
      </Card>

      <Card title="Đơn vị tính phổ biến" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, lineHeight: '1.8' }}>
          <div>
            • <strong>kg:</strong> Kilogram (trà, đường, bột...)
          </div>
          <div>
            • <strong>lít:</strong> Lít (sữa, nước...)
          </div>
          <div>
            • <strong>gói:</strong> Gói (gia vị, trân châu...)
          </div>
          <div>
            • <strong>thùng:</strong> Thùng (chai, lon...)
          </div>
          <div>
            • <strong>hộp:</strong> Hộp đóng gói
          </div>
          <div>
            • <strong>cái:</strong> Đếm từng cái
          </div>
        </div>
      </Card>
    </>
  );
};

export default IngredientFormSidebar;
