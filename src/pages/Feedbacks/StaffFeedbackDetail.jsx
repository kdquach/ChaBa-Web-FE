import React, { useEffect, useState } from "react";
import {
  Card,
  Space,
  Typography,
  Rate,
  Button,
  Modal,
  Form,
  Input,
  message,
  List,
  Popconfirm,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchFeedbackById,
  fetchFeedbackReplies,
  addFeedbackReply,
  updateFeedbackReply,
  deleteFeedbackReply,
  deleteFeedback,
} from "../../api/feedbacks";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Status is removed from UI per request

const StaffFeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyModal, setReplyModal] = useState({ open: false, mode: "create", current: null });
  const [replyForm] = Form.useForm();
  const [replyLoading, setReplyLoading] = useState(false);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetchFeedbackById(id);
      setFeedback(res);
    } catch (e) {
      message.error("Không thể tải chi tiết đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async () => {
    try {
      const res = await fetchFeedbackReplies(id, { page: 1, limit: 100 });
      setReplies(res?.data || res?.results || []);
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    // mark as seen locally for current user
    try {
      const key = `feedback:seen:${user?.id || "anon"}`;
      const raw = localStorage.getItem(key);
      const set = new Set(Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []);
      set.add(id);
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch {}

    loadFeedback();
    loadReplies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openCreateReply = () => {
    replyForm.resetFields();
    setReplyModal({ open: true, mode: "create", current: null });
  };

  const openEditReply = (reply) => {
    replyForm.setFieldsValue({ content: reply.content });
    setReplyModal({ open: true, mode: "edit", current: reply });
  };

  const handleReplySubmit = async () => {
    try {
      setReplyLoading(true);
      const values = await replyForm.validateFields();
      if (replyModal.mode === "create") {
        await addFeedbackReply(id, { content: values.content, parentId: null });
        message.success("Đã thêm phản hồi");
        // mark replied locally
        try {
          const key = `feedback:replied:${user?.id || "anon"}`;
          const raw = localStorage.getItem(key);
          const set = new Set(Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []);
          set.add(id);
          localStorage.setItem(key, JSON.stringify(Array.from(set)));
        } catch {}
      } else {
        await updateFeedbackReply(id, replyModal.current.id || replyModal.current._id, { content: values.content });
        message.success("Đã cập nhật phản hồi");
      }
      setReplyModal({ open: false, mode: "create", current: null });
      loadReplies();
    } catch (e) {
      if (e?.errorFields) return; // validation
      message.error("Xử lý phản hồi thất bại");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteReply = async (reply) => {
    try {
      await deleteFeedbackReply(reply.id || reply._id);
      message.success("Đã xóa phản hồi");
      loadReplies();
    } catch (e) {
      message.error("Không thể xóa phản hồi");
    }
  };

  const handleDeleteFeedback = () => {
    Modal.confirm({
      title: "Xác nhận xóa đánh giá",
      content: "Bạn có chắc muốn xóa đánh giá này?",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteFeedback(id);
          message.success("Đã xóa đánh giá");
          navigate("/feedbacks");
        } catch (e) {
          message.error("Không thể xóa đánh giá");
        }
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Chi tiết đánh giá"
        subtitle="Quản lý phản hồi cho đánh giá"
        showBack
        backPath="/feedbacks"
        extra={
          <Space>
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteFeedback}>
              Xóa đánh giá
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateReply}>
              Thêm phản hồi
            </Button>
          </Space>
        }
      />

      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Card loading={loading} title="Thông tin đánh giá">
          {feedback && (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={4} style={{ margin: 0 }}>
                {
                  (typeof feedback?.productId === "object" && feedback?.productId?.name) ||
                  feedback?.product?.name ||
                  feedback?.productName ||
                  "Sản phẩm"
                }
              </Title>
              <Rate disabled value={feedback.rating} />
              <Paragraph>{feedback.content}</Paragraph>
              <Text type="secondary">
                Người dùng: {
                  (typeof feedback?.userId === "object" && (feedback?.userId?.name || feedback?.userId?.email)) ||
                  feedback?.user?.name ||
                  feedback?.userName ||
                  "Ẩn danh"
                }
              </Text>
            </Space>
          )}
        </Card>

        <Card title={`Phản hồi (${replies.length})`} extra={<Button onClick={openCreateReply}>Thêm phản hồi</Button>}>
          <List
            dataSource={replies}
            locale={{ emptyText: "Chưa có phản hồi" }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button size="small" icon={<EditOutlined />} onClick={() => openEditReply(item)} key="edit">
                    Sửa
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Xóa phản hồi?"
                    onConfirm={() => handleDeleteReply(item)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>
                        {
                          (typeof item?.userId === "object" && (item?.userId?.name || item?.userId?.email)) ||
                          item?.user?.name ||
                          item?.userName ||
                          "Người dùng"
                        }
                      </Text>
                      {/* Keep role tag for reply source */}
                      <span style={{ fontSize: 12, color: "#888" }}>{item.isStaffReply ? "Staff" : "User"}</span>
                    </Space>
                  }
                  description={<Paragraph style={{ marginBottom: 4 }}>{item.content}</Paragraph>}
                />
              </List.Item>
            )}
          />
        </Card>
      </Space>

      <Modal
        open={replyModal.open}
        onCancel={() => setReplyModal({ open: false, mode: "create", current: null })}
        title={replyModal.mode === "create" ? "Thêm phản hồi" : "Chỉnh sửa phản hồi"}
        confirmLoading={replyLoading}
        onOk={handleReplySubmit}
        okText={replyModal.mode === "create" ? "Thêm" : "Lưu"}
      >
        <Form form={replyForm} layout="vertical">
          <Form.Item
            label="Nội dung"
            name="content"
            rules={[{ required: true, message: "Vui lòng nhập nội dung phản hồi" }]}
          >
            <TextArea rows={4} placeholder="Nhập phản hồi..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffFeedbackDetail;