import React, { useState } from "react";
import { Form, Input, Button, Alert, Space, Typography } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  PhoneOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AuthLayout from "../../layouts/AuthLayout";

const { Text } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError("");

      // Remove confirmPassword from values before sending to API
      const { confirmPassword, ...registerData } = values;

      const data = await register(registerData);
      console.log("Đăng ký thành công:", data);
      // Redirect to login page after successful registration
      navigate("/login", {
        state: {
          message: "Đăng ký thành công! Vui lòng đăng nhập.",
        },
      });
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert
          message="Lỗi đăng ký"
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
        name="register"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập họ và tên!" },
            { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
            { max: 50, message: "Họ và tên không được quá 50 ký tự!" },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Họ và tên"
            style={{ height: 44 }}
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Địa chỉ email"
            style={{ height: 44 }}
          />
        </Form.Item>

        <Form.Item
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            {
              pattern: /^(0[0-9]{9})$/,
              message: "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0!",
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="Số điện thoại"
            style={{ height: 44 }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message:
                "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mật khẩu"
            style={{ height: 44 }}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Xác nhận mật khẩu"
            style={{ height: 44 }}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item>
          <Space direction="vertical" style={{ width: "100%" }}>
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
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>

            <Button
              type="default"
              onClick={() => navigate("/login")}
              style={{
                width: "100%",
                height: 44,
                fontSize: 16,
              }}
            >
              Quay lại đăng nhập
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Text type="secondary">
          Đã có tài khoản?{" "}
          <Link to="/login" style={{ color: "#1890ff", fontWeight: 500 }}>
            Đăng nhập ngay
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default RegisterPage;
