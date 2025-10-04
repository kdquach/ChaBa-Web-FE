import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Table,
  InputNumber,
  message,
  Row,
  Col,
  Space,
} from "antd";
import { SaveOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import { createOrder, updateOrder, getOrder } from "../../api/orders";
import { fetchProducts } from "../../api/products";

const { Option } = Select;
const { TextArea } = Input;

const OrderFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    loadProducts();
    if (isEditing) {
      loadOrder();
    } else {
      // Thêm item đầu tiên cho đơn hàng mới
      setOrderItems([
        {
          key: Date.now(),
          productId: null,
          productName: "",
          price: 0,
          quantity: 1,
        },
      ]);
    }
  }, [id, isEditing]);

  const loadProducts = async () => {
    try {
      const response = await getProducts({ limit: 1000 });
      setProducts(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm");
    }
  };

  const loadOrder = async () => {
    try {
      setLoading(true);
      const order = await getOrder(id);

      form.setFieldsValue({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
      });

      const items = order.items.map((item) => ({
        ...item,
        key: item.id,
      }));
      setOrderItems(items);
    } catch (error) {
      message.error("Không thể tải thông tin đơn hàng");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  // Thêm item mới
  const addItem = () => {
    const newItem = {
      key: Date.now(),
      productId: null,
      productName: "",
      price: 0,
      quantity: 1,
    };
    setOrderItems([...orderItems, newItem]);
  };

  // Xóa item
  const removeItem = (key) => {
    if (orderItems.length <= 1) {
      message.warning("Đơn hàng phải có ít nhất 1 sản phẩm");
      return;
    }
    setOrderItems(orderItems.filter((item) => item.key !== key));
  };

  // Cập nhật item
  const updateItem = (key, field, value) => {
    const newItems = orderItems.map((item) => {
      if (item.key === key) {
        if (field === "productId") {
          const product = products.find((p) => p.id === value);
          return {
            ...item,
            productId: value,
            productName: product?.name || "",
            price: product?.price || 0,
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    setOrderItems(newItems);
  };

  // Tính tổng tiền
  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const discount = 0; // Có thể thêm logic giảm giá
    const total = subtotal - discount;

    return { subtotal, discount, total };
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      // Validate items
      const validItems = orderItems.filter(
        (item) => item.productId && item.quantity > 0
      );
      if (validItems.length === 0) {
        message.error("Vui lòng chọn ít nhất 1 sản phẩm");
        return;
      }

      setSubmitting(true);
      const { subtotal, discount, total } = calculateTotal();

      const orderData = {
        ...values,
        items: validItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        discount,
        total,
        status: "pending",
        paymentStatus: "pending",
      };

      if (isEditing) {
        await updateOrder(id, orderData);
        message.success("Cập nhật đơn hàng thành công!");
      } else {
        await createOrder(orderData);
        message.success("Tạo đơn hàng thành công!");
      }

      navigate("/orders");
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi lưu đơn hàng");
    } finally {
      setSubmitting(false);
    }
  };

  // Cấu hình cột cho bảng items
  const itemColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "productId",
      width: "40%",
      render: (value, record) => (
        <Select
          value={value}
          placeholder="Chọn sản phẩm"
          style={{ width: "100%" }}
          onChange={(val) => updateItem(record.key, "productId", val)}
          showSearch
          optionFilterProp="children"
        >
          {products.map((product) => (
            <Option key={product.id} value={product.id}>
              {product.name} - {product.price.toLocaleString()}₫
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "15%",
      render: (value, record) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => updateItem(record.key, "quantity", val || 1)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: "20%",
      render: (price) => `${price.toLocaleString()} ₫`,
    },
    {
      title: "Thành tiền",
      key: "total",
      width: "20%",
      render: (_, record) => (
        <strong>{(record.price * record.quantity).toLocaleString()} ₫</strong>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "5%",
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
        />
      ),
    },
  ];

  const { subtotal, discount, total } = calculateTotal();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng mới"}
        subtitle={
          isEditing
            ? "Cập nhật thông tin đơn hàng"
            : "Nhập thông tin đơn hàng mới"
        }
        showBack
        backPath="/orders"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            {/* Thông tin khách hàng */}
            <Card title="Thông tin khách hàng" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tên khách hàng"
                    name="customerName"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên khách hàng!",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập tên khách hàng" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="customerPhone"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại!",
                      },
                      {
                        pattern: /^[0-9]{10,11}$/,
                        message: "Số điện thoại không hợp lệ!",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Chi tiết đơn hàng */}
            <Card
              title="Chi tiết đơn hàng"
              extra={
                <Button type="dashed" icon={<PlusOutlined />} onClick={addItem}>
                  Thêm sản phẩm
                </Button>
              }
              style={{ marginBottom: 16 }}
            >
              <Table
                columns={itemColumns}
                dataSource={orderItems}
                rowKey="key"
                pagination={false}
                size="small"
              />
            </Card>

            {/* Thông tin bổ sung */}
            <Card title="Thông tin bổ sung">
              <Form.Item
                label="Phương thức thanh toán"
                name="paymentMethod"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn phương thức thanh toán!",
                  },
                ]}
              >
                <Select placeholder="Chọn phương thức thanh toán">
                  <Option value="cash">Tiền mặt</Option>
                  <Option value="card">Thẻ tín dụng</Option>
                  <Option value="transfer">Chuyển khoản</Option>
                  <Option value="ewallet">Ví điện tử</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Ghi chú" name="notes">
                <TextArea rows={3} placeholder="Nhập ghi chú đặc biệt..." />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* Tổng kết đơn hàng */}
            <Card
              title="Tổng kết đơn hàng"
              style={{ position: "sticky", top: 24 }}
            >
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString()} ₫</span>
                </div>
                {discount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span>Giảm giá:</span>
                    <span style={{ color: "#ff4d4f" }}>
                      -{discount.toLocaleString()} ₫
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 18,
                    fontWeight: "bold",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 8,
                    color: "#52c41a",
                  }}
                >
                  <span>Tổng cộng:</span>
                  <span>{total.toLocaleString()} ₫</span>
                </div>
              </div>

              <Space style={{ width: "100%" }} direction="vertical">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<SaveOutlined />}
                  size="large"
                  style={{ width: "100%" }}
                >
                  {isEditing ? "Cập nhật đơn hàng" : "Tạo đơn hàng"}
                </Button>
                <Button
                  onClick={() => navigate("/orders")}
                  size="large"
                  style={{ width: "100%" }}
                >
                  Hủy
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default OrderFormPage;
