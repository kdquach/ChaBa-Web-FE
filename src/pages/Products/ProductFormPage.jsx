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
  Table,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  createProduct,
  updateProduct,
  fetchProductById,
  fetchCategories,
} from "../../api/products";
import { getAllToppings } from "../../api/toppings";
import { fetchIngredients } from "../../api/ingredients";

const { TextArea } = Input;
const { Option } = Select;

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id, mode } = useParams(); // Get mode from URL
  const isEditing = Boolean(id) && mode === "edit";
  const isViewing = Boolean(id) && mode === "view";
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [recipeItems, setRecipeItems] = useState([]); // { ingredientId, quantity }
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientQuantity, setIngredientQuantity] = useState(1);

  // Load dữ liệu khi edit
  useEffect(() => {
    if (isEditing || isViewing) {
      loadProduct();
    }
    loadCategories();
    loadToppings();
    loadIngredients();
  }, [id, isEditing, isViewing]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await fetchProductById(id);
      console.log("Fetched product data:", response); // 🔥 debug

      // Prepare recipe: array of { ingredientId, quantity } or convert from IDs
      let recipeItemsValue = [];
      if (Array.isArray(response.recipe)) {
        recipeItemsValue = response.recipe.map((item) => {
          if (typeof item === "object" && item.ingredientId) {
            // Backend returns { ingredientId, quantity }
            return {
              ingredientId: item.ingredientId,
              quantity: item.quantity || 1,
            };
          } else if (typeof item === "object" && item.id) {
            // Backend returns { id, ... }
            return { ingredientId: item.id, quantity: item.quantity || 1 };
          } else {
            // Just IDs
            return { ingredientId: item, quantity: 1 };
          }
        });
      }
      setRecipeItems(recipeItemsValue);

      // Prepare toppings: similar logic
      let toppingsValue = [];
      if (Array.isArray(response.toppings)) {
        toppingsValue = response.toppings.map((item) =>
          typeof item === "object" && item.id ? item.id : item
        );
      }

      // Set các giá trị form từ response
      form.setFieldsValue({
        name: response.name,
        price: response.price,
        status: response.status,
        description: response.description,
        categoryId: response.categoryId,
        toppings: toppingsValue,
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

  const loadToppings = async () => {
    try {
      const response = await getAllToppings({ limit: 100 });
      if (response?.results) {
        setToppings(response.results);
      } else if (Array.isArray(response)) {
        setToppings(response);
      } else {
        setToppings([]);
      }
    } catch (error) {
      console.error("Error loading toppings:", error);
      setToppings([]);
    }
  };

  const loadIngredients = async () => {
    try {
      const response = await fetchIngredients({ limit: 100 });
      if (response?.results) {
        setIngredients(response.results);
      } else if (Array.isArray(response)) {
        setIngredients(response);
      } else {
        setIngredients([]);
      }
    } catch (error) {
      console.error("Error loading ingredients:", error);
      setIngredients([]);
    }
  };

  // Handle adding ingredient to recipe
  const handleAddIngredient = () => {
    if (!selectedIngredient) {
      message.warning("Vui lòng chọn nguyên liệu");
      return;
    }
    if (!ingredientQuantity || ingredientQuantity <= 0) {
      message.warning("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    // Check if ingredient already exists
    const exists = recipeItems.find(
      (item) => item.ingredientId === selectedIngredient
    );
    if (exists) {
      message.warning("Nguyên liệu đã được thêm");
      return;
    }

    setRecipeItems([
      ...recipeItems,
      { ingredientId: selectedIngredient, quantity: ingredientQuantity },
    ]);
    setSelectedIngredient(null);
    setIngredientQuantity(1);
  };

  // Handle removing ingredient from recipe
  const handleRemoveIngredient = (ingredientId) => {
    setRecipeItems(
      recipeItems.filter((item) => item.ingredientId !== ingredientId)
    );
  };

  // Get ingredient name by ID
  const getIngredientById = (ingredientId) => {
    return ingredients.find((ing) => ing.id === ingredientId);
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

      // Format recipe as array of { ingredientId, quantity }
      const productData = {
        ...values,
        recipe: recipeItems,
        toppings: values.toppings || [],
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
        title={
          isViewing
            ? "Chi tiết sản phẩm"
            : isEditing
            ? "Chỉnh sửa sản phẩm"
            : "Thêm sản phẩm mới"
        }
        subtitle={
          isViewing
            ? "Xem thông tin chi tiết sản phẩm"
            : isEditing
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
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" disabled={isViewing} />
              </Form.Item>

              <Form.Item
                label="Mô tả"
                name="description"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả sản phẩm!" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập mô tả chi tiết"
                  disabled={isViewing}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Danh mục"
                    name="categoryId"
                    rules={[
                      { required: true, message: "Vui lòng chọn danh mục!" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn danh mục"
                      disabled={isViewing}
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
              </Row>

              <Form.Item
                label="Nguyên liệu chính (Recipe)"
                tooltip="Chọn nguyên liệu và nhập số lượng cần thiết"
              >
                {!isViewing && (
                  <Space.Compact style={{ width: "100%", marginBottom: 16 }}>
                    <Select
                      placeholder="Chọn nguyên liệu"
                      value={selectedIngredient}
                      onChange={setSelectedIngredient}
                      showSearch
                      style={{ flex: 1 }}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children?.toString() || "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {ingredients
                        .filter(
                          (ing) =>
                            !recipeItems.find(
                              (item) => item.ingredientId === ing.id
                            )
                        )
                        .map((ingredient) => (
                          <Option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} ({ingredient.unit})
                          </Option>
                        ))}
                    </Select>
                    <InputNumber
                      min={0.01}
                      step={0.1}
                      placeholder="Số lượng"
                      value={ingredientQuantity}
                      onChange={setIngredientQuantity}
                      style={{ width: 120 }}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddIngredient}
                    >
                      Thêm
                    </Button>
                  </Space.Compact>
                )}

                {recipeItems.length > 0 ? (
                  <Table
                    dataSource={recipeItems}
                    pagination={false}
                    size="small"
                    rowKey="ingredientId"
                    columns={[
                      {
                        title: "Nguyên liệu",
                        dataIndex: "ingredientId",
                        key: "ingredientId",
                        render: (ingredientId) => {
                          const ing = getIngredientById(ingredientId);
                          return ing ? `${ing.name}` : ingredientId;
                        },
                      },
                      {
                        title: "Số lượng",
                        dataIndex: "quantity",
                        key: "quantity",
                        width: 120,
                        render: (quantity, record) => {
                          const ing = getIngredientById(record.ingredientId);
                          return `${quantity} ${ing?.unit || ""}`;
                        },
                      },
                      ...(!isViewing
                        ? [
                            {
                              title: "Thao tác",
                              key: "action",
                              width: 100,
                              render: (_, record) => (
                                <Popconfirm
                                  title="Xóa nguyên liệu này?"
                                  onConfirm={() =>
                                    handleRemoveIngredient(record.ingredientId)
                                  }
                                  okText="Xóa"
                                  cancelText="Hủy"
                                >
                                  <Button
                                    type="link"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                  >
                                    Xóa
                                  </Button>
                                </Popconfirm>
                              ),
                            },
                          ]
                        : []),
                    ]}
                  />
                ) : (
                  <div
                    style={{
                      color: "#999",
                      fontStyle: "italic",
                      padding: "8px 0",
                    }}
                  >
                    Chưa có nguyên liệu nào
                  </div>
                )}
              </Form.Item>

              <Form.Item
                label="Toppings"
                name="toppings"
                tooltip="Chọn các topping có thể thêm vào sản phẩm"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn toppings"
                  disabled={isViewing}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {toppings.map((topping) => (
                    <Option key={topping.id} value={topping.id}>
                      {topping.name} (+{topping.price?.toLocaleString()}₫)
                    </Option>
                  ))}
                </Select>
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
                  disabled={isViewing}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => navigate("/products")}>
                    {isViewing ? "Quay lại" : "Hủy"}
                  </Button>
                  {!isViewing && (
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitting}
                      icon={<SaveOutlined />}
                    >
                      {isEditing ? "Cập nhật" : "Tạo sản phẩm"}
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Hình ảnh sản phẩm">
            {isViewing ? (
              // In view mode, just show the image
              fileList.length > 0 && (
                <img
                  src={fileList[0].url}
                  alt="Product"
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

export default ProductFormPage;
