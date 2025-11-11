import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Card,
  Space,
  Select,
  Rate,
    Tag,
  Button,
  Input,
  Modal,
  message,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import dayjs from "dayjs";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchFeedbacks,
  deleteFeedback,
  buildSort,
} from "../../api/feedbacks";
import { fetchProducts } from "../../api/products";

const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;

// Removed status column per request, so no STATUS_COLORS needed

const StaffFeedbackList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sorter, setSorter] = useState({ field: undefined, order: undefined });
  const [filters, setFilters] = useState({ productId: undefined, rating: undefined, search: "", processStatus: undefined });

  const loadProducts = async () => {
    try {
      const res = await fetchProducts({ page: 1, limit: 100 });
      // BE may return { results, page, totalResults }
      setProducts(res?.data || res?.results || []);
    } catch (e) {
      // silent
    }
  };

  const loadData = async (overrides = {}) => {
    try {
      setLoading(true);
      // sanitize params: BE does not allow 'search' in query
      const merged = { ...filters, ...overrides };
                const { search, processStatus, page: oPage, limit: oLimit, ...serverFilters } = merged;
      // remove undefined/null/empty string from filters
      const cleanFilters = Object.fromEntries(
        Object.entries(serverFilters).filter(([_, v]) => v !== undefined && v !== null && v !== "")
      );
      const params = {
        page: oPage ?? pagination.current,
        limit: oLimit ?? pagination.pageSize,
        sortBy: buildSort(sorter.field, sorter.order),
        ...cleanFilters,
      };

    // BE supports productId, rating; we keep 'search' and 'processStatus' client-side
      const res = await fetchFeedbacks(params);
      // unify server response shape
      let rows = res?.data || res?.results || [];
      if (search && String(search).trim().length > 0) {
        const q = String(search).toLowerCase();
        rows = rows.filter((it) =>
          (it?.content || "").toLowerCase().includes(q) ||
          // user name from userId object or fallback fields
          ((typeof it?.userId === "object" ? (it?.userId?.name || it?.userId?.email) : (it?.user?.name || it?.userName)) || "").toLowerCase().includes(q) ||
          // product name from productId object or fallback
          ((typeof it?.productId === "object" ? it?.productId?.name : (it?.product?.name || it?.productName)) || "").toLowerCase().includes(q)
        );
      }
        // Filter by process status: new (not seen/replied), seen (seen, not replied), replied
        if (processStatus) {
          rows = rows.filter((it) => {
            const fid = it.id || it._id;
            const replied = isReplied(fid);
            const seen = isSeen(fid);
            if (processStatus === "replied") return replied;
            if (processStatus === "seen") return seen && !replied;
            if (processStatus === "new") return !seen && !replied;
            return true;
          });
        }
      setData(rows);
      setPagination((prev) => ({
        ...prev,
        total: res?.pagination?.total || res?.totalResults || rows.length,
        current: params.page ?? prev.current,
      }));
    } catch (e) {
      message.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (newPagination, _filters, newSorter) => {
    const nextSorter = { field: newSorter?.field, order: newSorter?.order };
    setPagination(newPagination);
    setSorter(nextSorter);
    loadData({ page: newPagination.current, limit: newPagination.pageSize, sortBy: buildSort(newSorter?.field, newSorter?.order) });
  };

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setPagination((p) => ({ ...p, current: 1 }));
    // Pass updated filters so BE receives new productId/rating immediately (fix double-click issue)
    loadData({ ...next, page: 1 });
  };

  const handleSearch = (value) => {
    const next = { ...filters, search: value };
    setFilters(next);
    setPagination((p) => ({ ...p, current: 1 }));
    loadData({ ...next, page: 1 });
  };

  const clearFilters = () => {
    const next = { productId: undefined, rating: undefined, search: "" };
    setFilters(next);
    setPagination((p) => ({ ...p, current: 1 }));
    loadData({ ...next, page: 1, limit: pagination.pageSize });
  };

  const productMap = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => map.set(p.id || p._id, p));
    return map;
  }, [products]);

  // --- Local processing state (seen/replied) helpers ---
  const storageKey = (type) => `feedback:${type}:${user?.id || "anon"}`;
  const getSet = (type) => {
    try {
      const raw = localStorage.getItem(storageKey(type));
      return new Set(Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  };
  const saveSet = (type, set) => {
    localStorage.setItem(storageKey(type), JSON.stringify(Array.from(set)));
  };
  const isSeen = (fid) => getSet("seen").has(fid);
  const isReplied = (fid) => getSet("replied").has(fid);
  const markSeen = (fid) => {
    const s = getSet("seen");
    s.add(fid);
    saveSet("seen", s);
  };

  // time ago short display
  const timeAgoShort = (date) => {
    const d = dayjs(date);
    if (!d.isValid()) return "-";
    const now = dayjs();
    const mins = Math.max(0, now.diff(d, "minute"));
    if (mins < 60) return `${mins || 1}p`;
    const hours = Math.max(1, now.diff(d, "hour"));
    if (hours < 24) return `${hours}h`;
    const days = Math.max(1, now.diff(d, "day"));
    if (days < 30) return `${days} ngày`;
    const months = Math.max(1, now.diff(d, "month"));
    if (months < 12) return `${months} tháng`;
    const years = Math.max(1, now.diff(d, "year"));
    return `${years} năm`;
  };

  const onDelete = (record) => {
    confirm({
      title: "Xác nhận xóa đánh giá",
      content: `Bạn có chắc muốn xóa đánh giá của ${record?.user?.name || "người dùng"}?`,
      okType: "danger",
      onOk: async () => {
        try {
          await deleteFeedback(record.id || record._id);
          message.success("Đã xóa đánh giá");
          loadData();
        } catch (e) {
          message.error("Không thể xóa đánh giá");
        }
      },
    });
  };

  const columns = [
      {
        title: "#",
        key: "index",
        render: (_ , __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      },
      {
        title: "Trạng thái",
        key: "processStatus",
        render: (_, record) => {
          const fid = record.id || record._id;
          if (isReplied(fid)) return <Tag color="green">Đã phản hồi</Tag>;
          if (isSeen(fid)) return <Tag color="blue">Đã xem</Tag>;
          return <Tag color="red">Mới</Tag>;
        },
      },
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => {
        const pid = record?.productId;
        if (pid && typeof pid === "object") return pid?.name || "-";
        if (typeof pid === "string") return productMap.get(pid)?.name || "-";
        return record?.product?.name || record?.productName || "-";
      },
    },
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => {
        const u = record?.userId || record?.user;
        if (u && typeof u === "object") return u?.name || u?.email || "-";
        return record?.userName || "-";
      },
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      sorter: true,
      render: (val) => <Rate disabled value={val} />,
    },
    // Status column removed as requested
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => <span title={dayjs(v).format("DD/MM/YYYY HH:mm")}>{timeAgoShort(v)}</span>,
    },

    {
      title: "thao tác",
      key: "actions",
      width: 120,
      // để auto width để tránh tạo scroll ngang
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            shape="circle"
            size="small"
            icon={<EyeOutlined />}
            title="Xem"
                    onClick={() => {
                      const fid = record.id || record._id;
                      markSeen(fid);
                      navigate(`/feedbacks/${fid}`);
                    }}
          />
          <Button
            type="text"
            danger
            shape="circle"
            size="small"
            icon={<DeleteOutlined />}
            title="Xóa"
            onClick={() => onDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const headerExtra = (
    <Space>
      <Button icon={<ReloadOutlined />} onClick={() => loadData()}>
        Tải lại
      </Button>
      <FilterOutlined style={{ color: "#999" }} />
    </Space>
  );

  if (loading && data.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader title="Quản lý đánh giá" subtitle="Xem, lọc và quản lý đánh giá sản phẩm" extra={headerExtra} />

      <Card style={{ marginBottom: 12 }}>
        <Space wrap>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Chọn sản phẩm"
            style={{ width: 260 }}
            value={filters.productId}
            onChange={(v) => handleFilterChange("productId", v)}
          >
            {(products || []).map((p) => (
              <Option key={p.id || p._id} value={p.id || p._id} label={p.name}>
                {p.name}
              </Option>
            ))}
          </Select>

          <Select
            allowClear
            placeholder="Trạng thái xử lý"
            style={{ width: 180 }}
            value={filters.processStatus}
            onChange={(v) => handleFilterChange("processStatus", v)}
          >
            <Option value="new">Mới</Option>
            <Option value="seen">Đã xem</Option>
            <Option value="replied">Đã phản hồi</Option>
          </Select>

          {/* Trạng thái đã được yêu cầu bỏ, nên không hiển thị Select trạng thái */}

          <Select
            allowClear
            placeholder="Chọn mức đánh giá"
            style={{ width: 200 }}
            value={filters.rating}
            onChange={(v) => handleFilterChange("rating", v)}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <Option key={r} value={r}>
                <Rate disabled value={r} />
              </Option>
            ))}
          </Select>

          <Search
            allowClear
            placeholder="Tìm trong nội dung"
            style={{ width: 280 }}
            onSearch={handleSearch}
          />

          <Button onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey={(r) => r.id || r._id}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          size="small"
        />
      </Card>
    </div>
  );
};

export default StaffFeedbackList;
