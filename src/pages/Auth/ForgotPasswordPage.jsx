import React, { useState } from "react";
import { Form, Input, Button, Alert, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { requestPasswordReset } from "../../api/auth";

const { Text } = Typography;

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError("");

      await requestPasswordReset(values.email);

      // navigate to verify OTP page with flow reset and email so user can enter OTP
      navigate("/auth/verify-otp", {
        state: { registerData: { email: values.email }, flow: "reset" },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Yêu cầu thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert
          type="error"
          message="Lỗi"
          description={error}
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setError("")}
        />
      )}

      <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email đăng ký" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: "100%", height: 44 }}
          >
            Gửi mã xác thực
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Text type="secondary">
          Sau khi nhận mã, bạn sẽ được chuyển tới trang nhập OTP để đổi mật khẩu
        </Text>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
