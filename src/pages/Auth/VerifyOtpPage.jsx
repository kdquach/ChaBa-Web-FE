import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Alert, Typography } from "antd";
import { MailOutlined, PhoneOutlined, KeyOutlined } from "@ant-design/icons";
import AuthLayout from "../../layouts/AuthLayout";
import { verifyRegisterOtp, verifyForgotPasswordOtp } from "../../api/auth";

const { Text } = Typography;

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registerData = location.state?.registerData || {};
  // flow can be 'register' (default) or 'reset'
  const flow = location.state?.flow || location.state?.next || "register";

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // pre-fill email if available
    form.setFieldsValue({
      email: registerData.email,
    });
  }, [registerData, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError("");

      // Compose payload: include original register data and otp
      const payload = {
        ...registerData,
        otp: values.otp,
      };

      if (flow === "register") {
        await verifyRegisterOtp(payload);
      } else if (flow === "reset") {
        await verifyForgotPasswordOtp(payload);
      }

      // On success, behave based on flow
      if (flow === "reset") {
        // navigate to reset password page and pass email and otp so user can set a new password
        navigate("/auth/reset-password", {
          state: { email: registerData.email, otp: values.otp },
        });
      } else {
        // default: registration verification -> go to login
        navigate("/login", {
          state: { message: "Xác thực OTP thành công. Vui lòng đăng nhập." },
        });
      }
    } catch (err) {
      // err may be Error or axios error
      const message =
        err?.response?.data?.message || err.message || "Xác thực thất bại";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert
          type="error"
          message="Lỗi xác thực OTP"
          description={error}
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setError("")}
        />
      )}

      <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
        <Form.Item label="Email" name="email">
          <Input prefix={<MailOutlined />} disabled />
        </Form.Item>

        <Form.Item
          label="Mã OTP"
          name="otp"
          rules={[{ required: true, message: "Vui lòng nhập mã OTP" }]}
        >
          <Input prefix={<KeyOutlined />} placeholder="Nhập mã OTP" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: "100%", height: 44 }}
          >
            Xác thực OTP
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Text type="secondary">Bạn đã có mã? </Text>
        <Link to="/login">Quay lại đăng nhập</Link>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
