import React, { useEffect, useState } from "react";
import { Card, DatePicker } from "antd";
import dayjs from "dayjs";
import { Pie } from "@ant-design/plots";
import { getTopProducts } from "../../api/orders";

const { RangePicker } = DatePicker;

const TopProductsPie = () => {
	const [range, setRange] = useState([dayjs().subtract(30, "day"), dayjs()]);
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);

	const load = async () => {
		try {
			setLoading(true);
			const [from, to] = range || [];
			const rows = await getTopProducts({
				from: from?.startOf("day").toISOString(),
				to: to?.endOf("day").toISOString(),
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

	const config = {
		data,
		angleField: "value",
		colorField: "type",
		radius: 0.9,
		label: {
			type: "outer",
			content: ({ type, value }) => `${type}: ${value}`,
		},
		interactions: [{ type: "element-active" }],
	};

	return (
		<Card title="Sản phẩm bán chạy" extra={<RangePicker value={range} onChange={setRange} />} loading={loading}>
			<Pie {...config} />
		</Card>
	);
};

export default TopProductsPie;
