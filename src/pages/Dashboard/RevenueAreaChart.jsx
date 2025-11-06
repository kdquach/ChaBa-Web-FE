import React, { useEffect, useMemo, useState } from "react";
import { Card, DatePicker, Select, Space } from "antd";
import dayjs from "dayjs";
import ReactApexChart from "react-apexcharts";
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

  // Read CSS variable for primary color so chart follows theme
  const css = (name, fallback) =>
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
      : fallback;
  const primaryColor = css('--color-primary', '#00ac45');
  const mutedColor = css('--color-text-muted', '#6b7280');
  const gridColor = css('--color-border', 'rgba(1,50,55,0.06)');
  const accentColor = css('--color-accent', '#eac784');

  const apexOptions = {
    chart: {
      type: "area",
      animations: { enabled: true, easing: "easeinout", speed: 600 },
      toolbar: { show: false },
      foreColor: mutedColor,
    },
    colors: [primaryColor],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: [primaryColor],
        inverseColors: false,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 60, 100],
      },
    },
    grid: { borderColor: gridColor },
    xaxis: {
      type: "category",
      labels: { rotate: -45 },
    },
    yaxis: {
      labels: {
        formatter: (val) => (val >= 1000 ? `${Math.round(val / 1000)}k` : `${val}`),
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${(val || 0).toLocaleString()} ₫`,
      },
    },
  };

  return (
    <Card
      className="chart-card"
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
      <ReactApexChart
        type="area"
        options={apexOptions}
        series={[{ name: "Doanh thu", data: series.map((d) => ({ x: d.time, y: d.revenue })) }]}
        height={300}
      />
    </Card>
  );
};

export default RevenueAreaChart;
