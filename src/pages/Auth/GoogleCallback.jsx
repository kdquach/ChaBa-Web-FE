import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Alert } from "antd";
import { useAuth } from "../../hooks/useAuth";
import AuthLayout from "../../layouts/AuthLayout";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const userParam = searchParams.get("user");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setLoading(false);
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        if (token && userParam) {
          try {
            // Parse user data
            const userData = JSON.parse(decodeURIComponent(userParam));

            // Set authentication data
            await loginWithGoogle({
              token,
              user: userData,
              tokens: {
                access: { token },
                refresh: { token }, // Có thể cần refresh token từ backend
              },
            });

            // Redirect to dashboard
            navigate("/", { replace: true });
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            setError("Dữ liệu người dùng không hợp lệ");
          }
        } else {
          setError("Thiếu thông tin đăng nhập từ Google");
        }
      } catch (err) {
        console.error("Google callback error:", err);
        setError("Có lỗi xảy ra trong quá trình đăng nhập");
      } finally {
        setLoading(false);
        if (error) {
          setTimeout(() => navigate("/login"), 3000);
        }
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, loginWithGoogle]);

  if (loading) {
    return (
      <AuthLayout>
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang xử lý đăng nhập...</p>
        </div>
      </AuthLayout>
    );
  }

  if (error) {
    return (
      <AuthLayout>
        <Alert
          message="Lỗi đăng nhập"
          description={error}
          type="error"
          showIcon
        />
        <p style={{ textAlign: "center", marginTop: 16 }}>
          Đang chuyển hướng về trang đăng nhập...
        </p>
      </AuthLayout>
    );
  }

  return null;
};

export default GoogleCallback;
