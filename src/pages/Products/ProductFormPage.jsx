import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  InputNumber,
  Switch,
  message,
  Card,
  Row,
  Col,
  Space,
} from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  createProduct,
  updateProduct,
  fetchProductById,
  fetchCategories,
} from "../../api/products";

const { TextArea } = Input;
const { Option } = Select;

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);

  // Load dữ liệu khi edit
  useEffect(() => {
    if (isEditing) {
      loadProduct();
    }
    loadCategories();
  }, [id, isEditing]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await fetchProductById(id);
      console.log("Fetched product data:", response); // 🔥 debug
      // Set các giá trị form từ response
      form.setFieldsValue({
        name: response.name,
        price: response.price,
        status: response.status,
        description: response.description,
        categoryId: response.categoryId,
        // Không cần xử lý ingredients vì API không trả về field này
      });

      // Set image to fileList if exists
      if (response.image) {
        setFileList([
          {
            uid: "-1",
            name: "product-image",
            status: "done",
            url: response.image, // Sử dụng trực tiếp URL từ API
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      message.error("Không thể tải thông tin sản phẩm");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetchCategories();
      if (response?.results) {
        setCategories(response.results);
      } else {
        console.error("Invalid categories response format:", response);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // Xử lý upload ảnh
  const handleUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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

      // Xử lý recipe thành array
      const recipe = values.recipe
        ? values.recipe
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const productData = {
        ...values,
        recipe,
        image: fileList[0],
      };

      console.log("Submitting product data:", productData); // 🔥 debug

      if (isEditing) {
        await updateProduct(id, productData);
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct(productData);
        message.success("Tạo sản phẩm thành công!");
      }

      navigate("/products");
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi lưu sản phẩm");
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
        title={isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        subtitle={
          isEditing
            ? "Cập nhật thông tin sản phẩm"
            : "Nhập thông tin sản phẩm mới"
        }
        showBack
        backPath="/products"
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
                status: "Đang bán",
                price: 0,
              }}
            >
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                  {
                    max: 100,
                    message: "Tên sản phẩm không được vượt quá 100 ký tự!",
                  },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>

              <Form.Item
                label="Mô tả"
                name="description"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả sản phẩm!" },
                  { max: 500, message: "Mô tả không được vượt quá 500 ký tự!" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập mô tả chi tiết về sản phẩm"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Danh mục"
                    name="categoryId" // Đổi từ category thành categoryId để match với API
                    rules={[
                      { required: true, message: "Vui lòng chọn danh mục!" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn danh mục sản phẩm"
                      showSearch
                      optionFilterProp="children"
                    >
                      {categories.map((category) => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Giá bán (₫)"
                    name="price"
                    rules={[
                      { required: true, message: "Vui lòng nhập giá bán!" },
                      {
                        type: "number",
                        min: 1000,
                        message: "Giá bán phải ít nhất 1,000 ₫!",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập giá bán"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Nguyên liệu chính"
                name="recipe"
                tooltip="Nhập các nguyên liệu, cách nhau bằng dấu phẩy"
              >
                <Input placeholder="Ví dụ: Trà đen, Sữa tươi, Đường" />
              </Form.Item>

              <Form.Item
                label="Trạng thái"
                name="status"
                valuePropName="checked"
                getValueFromEvent={(checked) =>
                  checked ? "Đang bán" : "Ngừng bán"
                }
                getValueProps={(value) => ({ checked: value === "Đang bán" })}
              >
                <Switch
                  checkedChildren="Đang bán"
                  unCheckedChildren="Ngừng bán"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => navigate("/products")}>Hủy</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    icon={<SaveOutlined />}
                  >
                    {isEditing ? "Cập nhật" : "Tạo sản phẩm"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Hình ảnh sản phẩm">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUpload}
              beforeUpload={beforeUpload}
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên hình ảnh</div>
                </div>
              )}
            </Upload>
            <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
              * Chỉ hỗ trợ định dạng JPG, PNG
              <br />* Kích thước tối đa 2MB
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductFormPage;
