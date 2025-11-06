import React from 'react';
import { Typography, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const PageHeader = ({ 
  title, 
  subtitle, 
  showBack = false, 
  backPath,
  extra,
  children 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{ 
      marginBottom: 24,
      paddingBottom: 16,
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 8
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            {showBack && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                style={{ marginRight: 8 }}
              />
            )}
            <Title level={2} style={{ margin: 0, color: 'var(--color-primary)' }}>
              {title}
            </Title>
          </div>
          {subtitle && (
            <p style={{ 
              color: 'var(--color-text-muted)', 
              margin: 0,
              fontSize: 14,
              marginLeft: showBack ? 40 : 0
            }}>
              {subtitle}
            </p>
          )}
        </div>
        
        {extra && (
          <Space>
            {extra}
          </Space>
        )}
      </div>
      
      {children}
    </div>
  );
};

export default PageHeader;