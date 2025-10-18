import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  InputNumber,
  message,
  Card,
  Row,
  Col,
  Space,
  Switch, // Cần Switch
} from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import client from "../../api/client";
import {
  createTopping, // Đã sửa API
  updateTopping, // Đã sửa API
  getTopping, // Đã sửa API
} from "../../api/toppings"; // Đã sửa API

const { Option } = Select;

const ToppingFormPage = () => {
  const navigate = useNavigate();
  const { id, mode } = useParams();
  const isEditing = Boolean(id) && mode === "edit";
  const isViewing = Boolean(id) && mode === "view";
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Load dữ liệu khi edit
  useEffect(() => {
    if (isEditing || isViewing) {
      loadTopping();
    }
  }, [id, isEditing, isViewing]); // Đã loại bỏ dependency loadCategories

  const loadTopping = async () => {
    try {
      setLoading(true);
      const response = await getTopping(id); // Gọi API Topping
      console.log("Fetched topping data:", response);

      // Set các giá trị form từ response
      form.setFieldsValue({
        name: response.name,
        price: response.price,
        isAvailable: response.isAvailable, // Dùng isAvailable thay cho status
      });

      // Set image to fileList if exists
      if (response.image) {
        setFileList([
          {
            uid: "-1",
            name: "topping-image",
            status: "done",
            url: response.image, // Sử dụng trực tiếp URL từ API
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading topping:", error);
      message.error("Không thể tải thông tin topping");
      navigate("/toppings");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý upload ảnh
  const handleUpload = ({ fileList: newFileList }) => {
    // Luôn chỉ giữ lại file mới nhất
    setFileList(newFileList.slice(-1));
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ có thể upload file ảnh!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Kích thước ảnh phải nhỏ hơn 2MB!");
      return false;
    }
    return false; // Prevent auto upload
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      // 1. TẠO BẢN SAO VÀ LÀM SẠCH DỮ LIỆU TEXT:
      // Xóa các trường Ant Design metadata (như 'image') trước khi tạo FormData
      const textValues = { ...values };
      delete textValues.image;

      const formData = new FormData();

      // 2. Append các trường văn bản (chuyển sang String)
      // Chuyển tất cả các giá trị text/number/boolean thành String để FormData gửi đúng
      Object.keys(textValues).forEach((key) => {
        formData.append(key, String(textValues[key]));
      });

      // 3. XỬ LÝ FILE ẢNH (Phần quan trọng)
      const currentFile = fileList[0];

      if (currentFile && currentFile.originFileObj) {
        // Trường hợp 1: Có file mới được chọn (dùng originFileObj để gửi binary data)
        formData.append("image", currentFile.originFileObj, currentFile.name);
      } else if (!isEditing && (!currentFile || !currentFile.url)) {
        // Trường hợp 2: Tạo mới và thiếu file (BẮT BUỘC)
        message.error("Vui lòng tải lên hình ảnh cho topping.");
        setSubmitting(false);
        return;
      }
      // Trường hợp 3: Edit và không có file mới được chọn (BE sẽ giữ lại URL ảnh cũ)

      // 4. Gọi API
      if (isEditing) {
        // Sử dụng updateTopping (đã cấu hình multipart headers trong topping.js)
        await updateTopping(id, formData);
        message.success("Cập nhật topping thành công!");
      } else {
        // Sử dụng createTopping (đã cấu hình multipart headers trong topping.js)
        await createTopping(formData);
        message.success("Tạo topping thành công!");
      }

      navigate("/toppings");
    } catch (error) {
      // 5. HIỂN THỊ LỖI CHI TIẾT TỪ BACKEND (ví dụ: Topping name already taken)
      const errorMessage =
        error.response?.data?.message ||
        "Operation failed. Vui lòng kiểm tra console để xem lỗi từ BE.";

      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title={
          isViewing
            ? "Chi tiết Topping" // Sửa title
            : isEditing
            ? "Chỉnh sửa Topping" // Sửa title
            : "Thêm Topping mới" // Sửa title
        }
        subtitle={
          isViewing
            ? "Xem thông tin chi tiết topping" // Sửa subtitle
            : isEditing
            ? "Cập nhật thông tin topping" // Sửa subtitle
            : "Nhập thông tin topping mới" // Sửa subtitle
        }
        showBack
        backPath="/toppings" // Sửa path
      />

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Thông tin cơ bản">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              initialValues={{
                isAvailable: true, // Sửa initial value
                price: 0,
              }}
            >
              <Form.Item
                label="Tên Topping" // Sửa label
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên topping!" },
                ]}
              >
                <Input placeholder="Nhập tên topping" disabled={isViewing} />
              </Form.Item>

              {/* LOẠI BỎ Form.Item: Mô tả */}
              {/* LOẠI BỎ Form.Item: Danh mục */}

              <Row gutter={16}>
                {/* Giữ lại 1 cột cho giá */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Giá bán (₫)"
                    name="price"
                    rules={[
                      { required: true, message: "Vui lòng nhập giá bán!" },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập giá bán"
                      disabled={isViewing}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
                {/* LOẠI BỎ Col thứ 2 (danh mục) */}
              </Row>

              {/* LOẠI BỎ Form.Item: Nguyên liệu chính (recipe) */}

              <Form.Item
                label="Trạng thái bán" // Sửa label
                name="isAvailable" // Sửa name
                valuePropName="checked"
                // SỬA LỖI: Cập nhật logic Switch cho boolean
                getValueFromEvent={(checked) => checked}
                getValueProps={(value) => ({ checked: value === true })}
              >
                <Switch
                  checkedChildren="Đang bán"
                  unCheckedChildren="Ngừng bán"
                  disabled={isViewing}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => navigate("/toppings")}>
                    {isViewing ? "Quay lại" : "Hủy"}
                  </Button>
                  {!isViewing && (
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitting}
                      icon={<SaveOutlined />}
                    >
                      {isEditing ? "Cập nhật" : "Tạo Topping"}
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Cột hình ảnh (GIỮ NGUYÊN) */}
        <Col xs={24} lg={8}>
          <Card title="Hình ảnh Topping">
            {isViewing ? (
              // In view mode, just show the image
              fileList.length > 0 && (
                <img
                  src={fileList[0].url}
                  alt="Topping"
                  style={{ width: "100%", maxWidth: 300 }}
                />
              )
            ) : (
              // In edit/create mode, show upload component
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleUpload}
                beforeUpload={beforeUpload}
                maxCount={1}
                disabled={isViewing}
              >
                {fileList.length < 1 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên hình ảnh</div>
                  </div>
                )}
              </Upload>
            )}
            {!isViewing && (
              <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
                * Chỉ hỗ trợ định dạng JPG, PNG
                <br />* Kích thước tối đa 2MB
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ToppingFormPage;
