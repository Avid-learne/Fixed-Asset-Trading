import Card from "@/components/ui/Card";

interface Trade {
	id: string;
	at: string;
	profit: string;
	date: string;
	status?: string;
}

export default function TradeList({ items }: { items?: Trade[] }) {
	const sample: Trade[] = items ?? [
		{ id: "#T-0015", at: "5,000 AT", profit: "$1,250", date: "2025-11-25", status: "Completed" },
		{ id: "#T-0014", at: "10,000 AT", profit: "$2,800", date: "2025-11-24", status: "Distributed" },
	];

	return (
		<Card>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-slate-200">
							<th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Trade ID</th>
							<th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">AT Invested</th>
							<th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Profit</th>
							<th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
							<th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
						</tr>
					</thead>
					<tbody>
						{sample.map((t) => (
							<tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
								<td className="py-3 px-4 text-sm font-mono">{t.id}</td>
								<td className="py-3 px-4 text-sm">{t.at}</td>
								<td className="py-3 px-4 text-sm font-medium text-green-600">{t.profit}</td>
								<td className="py-3 px-4 text-sm text-slate-600">{t.date}</td>
								<td className="py-3 px-4 text-sm">{t.status}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Card>
	);
}
