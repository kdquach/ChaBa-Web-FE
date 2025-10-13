import React, { useState, useEffect } from "react";
import { Form, Input, Button, Alert, message, Divider } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../hooks/useAuth";
import AuthLayout from "../../layouts/AuthLayout";

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy đường dẫn mà user muốn truy cập trước khi login
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (location.state?.message) {
      message.success(location.state.message);
      // Clear the state after showing message
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError("");

      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Google Login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      setError("");

      // Gửi id_token (credential) tới backend
      await loginWithGoogle({
        token: credentialResponse.credential, // Backend yêu cầu field "token"
      });

      message.success("Đăng nhập Google thành công!");
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || "Đăng nhập Google thất bại");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Xử lý Google Login error
  const handleGoogleError = () => {
    console.error("Google login failed");
    setError("Đăng nhập Google thất bại");
    setGoogleLoading(false);
  };

  return (
    <div>
      {error && (
        <Alert
          message="Lỗi đăng nhập"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          closable
          onClose={() => setError("")}
        />
      )}

      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
        initialValues={{
          email: "admin@example.com",
          password: "admin12345",
        }}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập email!",
            },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu!",
            },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              width: "100%",
              height: 44,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: "16px 0" }}>Hoặc</Divider>

      <div style={{ marginBottom: 16 }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="filled_blue"
          size="large"
          width="100%"
          text="signin_with"
          shape="rectangular"
          logo_alignment="left"
          loading={googleLoading}
        />
      </div>

      <Button
        type="default"
        onClick={() => navigate("/register")}
        style={{
          width: "100%",
          height: 44,
          fontSize: 16,
        }}
      >
        Đăng ký tài khoản mới
      </Button>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "#f8f9fa",
          borderRadius: 8,
          fontSize: 13,
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, marginBottom: 8 }}>
          Tài khoản demo:
        </p>
        <p style={{ margin: 0 }}>
          <strong>Admin:</strong> admin@example.com / admin12345
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
