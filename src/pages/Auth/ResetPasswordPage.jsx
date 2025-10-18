import React, { useState, useEffect } from "react";
import { Form, Input, Button, Alert, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { resetPassword } from "../../api/auth";
import Password from "antd/es/input/Password";

const { Text } = Typography;

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const token = location.state?.token; // optional

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (email) {
      form.setFieldsValue({ email });
    }
  }, [email, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError("");

      const { newPassword, confirmPassword } = values;
      if (newPassword !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        return;
      }

      // Build payload based on available data
      const payload = { email, password: newPassword };

      const response = await resetPassword(payload);

      navigate("/login", {
        state: {
          message:
            response.message || "Đổi mật khẩu thành công. Vui lòng đăng nhập.",
        },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Đổi mật khẩu thất bại";
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
        <Form.Item label="Email" name="email">
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: "100%", height: 44 }}
          >
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Text type="secondary">Hoàn tất đổi mật khẩu</Text>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
