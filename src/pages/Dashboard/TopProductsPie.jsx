import React, { useEffect, useState } from "react";
import { Card, DatePicker } from "antd";
import dayjs from "dayjs";
import ReactApexChart from "react-apexcharts";
import { fetchTopProducts } from "../../api/dashboard";

const { RangePicker } = DatePicker;

const TopProductsPie = () => {
	const [range, setRange] = useState([dayjs().subtract(30, "day"), dayjs()]);
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);

	const load = async () => {
		try {
			setLoading(true);
			const [from, to] = range || [];
			const rows = await fetchTopProducts({
				from: from?.startOf("day").toISOString(),
				to: to?.endOf("day").toISOString(),
				limit: 5,
			});
			setData(rows || []);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [range?.[0]?.valueOf(), range?.[1]?.valueOf()]);

		const css = (name, fallback) =>
			typeof window !== 'undefined'
				? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
				: fallback;
		const primary = css('--color-primary', '#0b421a');
		const accent = css('--color-accent', '#eac784');

		const labels = (data || []).map((d) => d.type);
		const series = (data || []).map((d) => d.value);
		const revenues = (data || []).map((d) => d.revenue || 0);

		const formatVND = (n) =>
			(typeof n === 'number' ? n : 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

		const options = {
			chart: { type: 'donut', animations: { enabled: true, speed: 500 }, toolbar: { show: false } },
			labels,
			colors: [primary, accent, '#86b89a', '#b9dcc6', '#6f4f37', '#c8ad71', '#7aa98b', '#a27b5c', '#d9c7a3'],
			legend: { position: 'bottom' },
			stroke: { colors: ['#fff'], width: 2 },
			dataLabels: { enabled: false },
			plotOptions: {
				pie: {
					donut: {
						size: '70%',
						labels: {
							show: true,
							total: { show: true, label: 'Top sản phẩm', fontSize: '14px' },
						},
					},
				},
			},
			tooltip: {
				y: { formatter: (val) => `${(val || 0).toLocaleString()} ly` },
				custom: function({ series, seriesIndex /*, dataPointIndex, w */ }) {
					const qty = Array.isArray(series) ? series[seriesIndex] : 0;
					const rev = revenues?.[seriesIndex] || 0;
					return (
						`<div class="apex-tooltip">
							<div class="apex-tooltip-row"><span>Số lượng</span><strong>${(qty || 0).toLocaleString()} ly</strong></div>
							<div class="apex-tooltip-row"><span>Doanh thu</span><strong>${formatVND(rev)}</strong></div>
						</div>`
					);
				}
			},
		};

	return (
				<Card className="chart-card" title="Sản phẩm bán chạy" extra={<RangePicker value={range} onChange={setRange} />} loading={loading}>
			<ReactApexChart type="donut" options={options} series={series} height={300} />
		</Card>
	);
};

export default TopProductsPie;
