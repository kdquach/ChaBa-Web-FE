import React, { memo, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Grid,
  Input,
  Row,
  Space,
  Tag,
  Typography,
  Upload,
  message,
  Alert,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, updateUser } from "../../api/users";
import AddressForm from "../../components/AddressForm";
import LoadingSpinner from "../../components/LoadingSpinner";
import { changePassword } from "../../api/auth";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const sectionCardStyle = {
  borderRadius: 12,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
  marginTop: 15,
};

const labelStyle = { fontWeight: 500 };

const containerStyle = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: 16,
};

const headerExtraGap = { gap: 8 };

function initials(name = "") {
  const parts = name.trim().split(" ");
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const ProfilePage = () => {
  const screens = useBreakpoint();

  const { updateUser: updateAuthUser, user: authUser, logout } = useAuth();

  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [user, setUser] = useState(null);

  const [infoLoading, setInfoLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user, form]);
  const loadUser = async () => {
    try {
      const userData = await getUser(authUser.id);
      setUser(userData);
      updateAuthUser(userData);
      setPreviewUrl(null);
      setFileList([]);
    } catch (error) {
      message.error("Failed to load user data");
    }
  };
  const avatarColor = useMemo(() => {
    const colors = [
      "#5B8FF9",
      "#5AD8A6",
      "#5D7092",
      "#F6BD16",
      "#E8684A",
      "#6DC8EC",
      "#9270CA",
    ];
    const key = (user?.email || user?.name || "?").length;
    return colors[key % colors.length];
  }, [user]);

  // Chuẩn hoá địa chỉ hiển thị từ nhiều dạng dữ liệu có thể có
  const formattedAddress = useMemo(() => {
    try {
      if (Array.isArray(user?.addresses) && user.addresses.length > 0) {
        const a = user.addresses[0];
        if (!a) return "";
        if (typeof a === "string") return a;
        const parts = [
          a?.street,
          a?.ward?.name,
          a?.district?.name,
          a?.city?.name,
        ].filter(Boolean);
        return parts.join(", ");
      }

      return "";
    } catch (e) {
      return "";
    }
  }, [user?.addresses]);

  const onSaveProfile = async (values) => {
    console.log("🚀 ~ onSaveProfile ~ values:", values);
    try {
      setInfoLoading(true);
      const newData = {
        ...values,
      };
      if (fileList.length > 0) {
        newData.avatar = fileList[0].originFileObj;
      }
      // Wire to API when available; for now just update local auth context
      await updateUser(authUser.id, newData);
      message.success("Cập nhật thông tin thành công");
      await loadUser();
    } catch (e) {
      const keyError = e?.response?.data?.message.split(":");
      if (keyError && keyError[2].includes("Invalid")) {
        message.error(`${keyError[1].toUpperCase()} không hợp lệ!`);
      } else {
        message.error(
          e?.response?.data?.message || "Cập nhật thông tin thất bại"
        );
      }
    } finally {
      setInfoLoading(false);
    }
  };

  const onChangePassword = async (values) => {
    try {
      setPwdLoading(true);
      values && delete values.confirmPassword;
      await changePassword(values);
      message.success(
        "Đổi mật khẩu thành công! Bạn sẽ chuyển về trang login sau 3s"
      );
      pwdForm.resetFields();
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 3000);
    } catch (e) {
      message.error(e?.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setPwdLoading(false);
    }
  };
  const onSaveAddress = async () => {
    try {
      setAddressLoading(true);
      // Wire to API when available; for now just update local auth context
      await updateUser(authUser.id, { addresses: user.addresses });
      message.success("Cập nhật địa chỉ thành công");
      await loadUser();
    } catch (e) {
      const keyError = e?.response?.data?.message.split(":");
      if (keyError && keyError[2].includes("required")) {
        message.error(
          `Vui lòng điền đầy đủ thông tin ${keyError[1]
            .split(".")[0]
            .toUpperCase()}!`
        );
      }
    } finally {
      setAddressLoading(false);
    }
  };
  const handleAddressChange = (newAddress) => {
    // Cập nhật địa chỉ mới vào user state
    setUser((prevUser) => ({
      ...prevUser,
      addresses: newAddress,
    }));
  };
  // Xử lý upload ảnh
  const handleUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // Tạo URL tạm để preview
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    } else {
      setPreviewUrl(null);
    }
  };

  const beforeUpload = (file) => {
    const isAllowed = ["image/jpeg", "image/png", "image/jpg"].includes(
      file.type
    );
    if (!isAllowed) {
      message.error("Chỉ chấp nhận ảnh JPG hoặc PNG!");
      return Upload.LIST_IGNORE; // NGĂN không thêm file vào danh sách
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Kích thước ảnh phải nhỏ hơn 2MB!");
      return Upload.LIST_IGNORE; // NGĂN upload file nặng
    }

    return true; // Cho phép upload
  };

  return (
    <div style={containerStyle}>
      <PageHeader
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin tài khoản và bảo mật"
        extra={
          <Space style={headerExtraGap}>
            <Button type="default" onClick={() => loadUser()}>
              Hoàn tác
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={infoLoading}
            >
              Lưu thay đổi
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginTop: -30 }}>
        <Col xs={24} lg={8}>
          <Card style={sectionCardStyle} bodyStyle={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Upload
                accept=".jpg,.jpeg,.png"
                listType="picture-circle"
                beforeUpload={beforeUpload} // không upload tự động
                onChange={handleUpload}
                maxCount={1}
                showUploadList={false} // ẩn danh sách mặc định
              >
                {fileList.length === 0 && !user?.avatar ? (
                  <Avatar
                    size={96}
                    style={{
                      backgroundColor: avatarColor,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    icon={<UserOutlined />}
                  />
                ) : (
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={previewUrl || user?.avatar}
                      alt="Avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
              </Upload>
              <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>
                {user?.name || "Người dùng"}
              </Title>
              <Text type="secondary" style={{ marginBottom: 8 }}>
                {user?.email || "email@domain.com"}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Tag
                  color={
                    user?.role === "admin"
                      ? "red"
                      : user?.role === "staff"
                      ? "blue"
                      : "green"
                  }
                  style={{ marginRight: 8 }}
                >
                  {user?.role === "admin"
                    ? "Quản trị viên"
                    : user?.role === "staff"
                    ? "Nhân viên"
                    : "Khách hàng"}
                </Tag>
                <Tag color={user?.status === "active" ? "green" : "orange"}>
                  {user?.status === "active"
                    ? "Đang hoạt động"
                    : "Ngừng hoạt động"}
                </Tag>
              </div>
            </div>

            <Divider style={{ marginTop: 16, marginBottom: 16 }} />
            <Descriptions
              column={1}
              size="small"
              colon
              items={[
                {
                  key: "address",
                  label: <span style={{ fontWeight: 500 }}>Địa chỉ</span>,
                  children: formattedAddress || "—",
                },
              ].filter(Boolean)}
            />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Form
                  form={addressForm}
                  layout="vertical"
                  onFinish={onSaveAddress}
                  colon={false}
                  style={{ width: "100%" }}
                >
                  <Form.Item name={"addresses"} style={{ marginBottom: 0 }}>
                    <div style={{ width: "100%" }}>
                      <AddressForm
                        value={user?.addresses}
                        onChange={handleAddressChange}
                      />
                    </div>
                  </Form.Item>
                  <Form.Item style={{ textAlign: "right", marginBottom: -10 }}>
                    <Space style={{ marginTop: 10, headerExtraGap }}>
                      <Button
                        type="primary"
                        onClick={onSaveAddress}
                        loading={addressLoading}
                      >
                        Lưu địa chỉ
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card style={sectionCardStyle} bodyStyle={{ padding: 20 }}>
            <Title level={5} style={{ marginTop: 0 }}>
              Thông tin cá nhân
            </Title>
            <Form
              form={form}
              layout={screens.lg ? "horizontal" : "vertical"}
              initialValues={user}
              onFinish={onSaveProfile}
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 17 }}
              colon={false}
            >
              <Form.Item
                rules={[
                  { required: true, message: "Vui lòng nhập tên người dùng!" },
                  { max: 100, message: "Tên không được vượt quá 100 ký tự!" },
                ]}
                label={<span style={labelStyle}>Họ và tên</span>}
                name="name"
              >
                <Input placeholder="Tên người dùng" />
              </Form.Item>
              <Form.Item
                label={<span style={labelStyle}>Email</span>}
                name="email"
                rules={[
                  { type: "email", message: "Email không hợp lệ" },
                  { required: true, message: "Vui lòng nhập email" },
                ]}
              >
                <Input placeholder="email@domain.com" />
              </Form.Item>
              <Form.Item
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
                label={<span style={labelStyle}>Số điện thoại</span>}
                name="phone"
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Form>
          </Card>

          <div style={{ height: 16 }} />

          {!user?.provider || user?.provider === "local" ? (
            <Card style={sectionCardStyle} bodyStyle={{ padding: 20 }}>
              <Title level={5} style={{ marginTop: 0 }}>
                Bảo mật
              </Title>
              <Form
                form={pwdForm}
                layout={screens.lg ? "horizontal" : "vertical"}
                onFinish={onChangePassword}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 17 }}
                colon={false}
              >
                <Form.Item
                  label={<span style={labelStyle}>Mật khẩu hiện tại</span>}
                  name="currentPassword"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu hiện tại",
                    },
                  ]}
                >
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
                <Form.Item
                  label={<span style={labelStyle}>Mật khẩu mới</span>}
                  name="newPassword"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới" },
                    { min: 8, message: "Tối thiểu 8 ký tự" },
                    {
                      validator: (_, value) => {
                        if (
                          value &&
                          !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)
                        ) {
                          return Promise.reject(
                            new Error(
                              "Mật khẩu phải chứa ít nhất một chữ và một số"
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>
                <Form.Item
                  label={<span style={labelStyle}>Nhập lại mật khẩu</span>}
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "Vui lòng nhập lại mật khẩu" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value)
                          return Promise.resolve();
                        return Promise.reject(
                          new Error("Mật khẩu nhập lại không khớp")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Space>
                    <Button onClick={() => pwdForm.resetFields()}>
                      Làm mới
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={pwdLoading}
                    >
                      Đổi mật khẩu
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          ) : (
            <Card>
              <Alert
                style={{ marginTop: 16 }}
                type="info"
                showIcon
                message="Lưu ý"
                description={
                  <div>
                    Tài khoản đăng nhập bằng mạng xã hội không có chức năng thay
                    đổi mật khẩu.
                  </div>
                }
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
