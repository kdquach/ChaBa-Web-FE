import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';
import viVN from 'antd/locale/vi_VN';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './hooks/useAuth';
import './App.css';

// Cấu hình theme chính cho ứng dụng
const theme = {
  token: {
    colorPrimary: '#52c41a', // Màu xanh lá - phù hợp với trà sữa
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: '#001529',
      siderBg: '#001529',
    },
  },
};

function App() {
  // Cấu hình message notification toàn cục
  React.useEffect(() => {
    message.config({
      top: 24,
      duration: 3,
      maxCount: 3,
    });
  }, []);

  return (
    <ConfigProvider theme={theme} locale={viVN}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;