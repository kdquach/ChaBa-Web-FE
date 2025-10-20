import React, { useEffect, useMemo, useState } from "react";
import { Card, DatePicker, Select, Space } from "antd";
import dayjs from "dayjs";
import { Area } from "@ant-design/plots";
import { getRevenueAnalytics } from "../../api/orders";

const { RangePicker } = DatePicker;

const presets = {
  last7: [dayjs().subtract(6, "day"), dayjs()],
  last30: [dayjs().subtract(29, "day"), dayjs()],
  thisMonth: [dayjs().startOf("month"), dayjs().endOf("month")],
};

const RevenueAreaChart = () => {
  const [groupBy, setGroupBy] = useState("day");
  const [range, setRange] = useState(presets.last30);
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState([]);

  const params = useMemo(() => {
    const [from, to] = range || [];
    return {
      from: from?.startOf("day").toISOString(),
      to: to?.endOf("day").toISOString(),
      groupBy,
    };
  }, [range, groupBy]);

  const load = async () => {
    if (!params.from || !params.to) return;
    try {
      setLoading(true);
      const data = await getRevenueAnalytics(params);
      setSeries((data?.buckets || []).map((b) => ({ time: b.key, revenue: b.revenue })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.from, params.to, params.groupBy]);

  const config = {
    data: series,
    xField: "time",
    yField: "revenue",
    height: 300,
    smooth: true,
    areaStyle: { fillOpacity: 0.3 },
    color: "#52c41a",
    tooltip: {
      formatter: (d) => ({ name: "Doanh thu", value: `${(d.revenue || 0).toLocaleString()} ₫` }),
    },
  };

  return (
    <Card
      title="Doanh thu theo thời gian"
      extra={
        <Space>
          <RangePicker value={range} onChange={(v) => setRange(v)} allowClear={false} />
          <Select
            style={{ width: 140 }}
            value={groupBy}
            onChange={setGroupBy}
            options={[
              { label: "Theo ngày", value: "day" },
              { label: "Theo tháng", value: "month" },
              { label: "Theo năm", value: "year" },
            ]}
          />
        </Space>
      }
      loading={loading}
    >
      <Area {...config} />
    </Card>
  );
};

export default RevenueAreaChart;
