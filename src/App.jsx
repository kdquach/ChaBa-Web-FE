import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';
import viVN from 'antd/locale/vi_VN';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './hooks/useAuth';
import './App.css';

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
    <ConfigProvider locale={viVN}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;