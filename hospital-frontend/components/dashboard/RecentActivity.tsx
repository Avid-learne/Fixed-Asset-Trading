import Card from "@/components/ui/Card";

interface Activity {
	id: string;
	title: string;
	date: string;
	amount?: string;
}

interface Props {
	items?: Activity[];
}

export default function RecentActivity({ items = [] }: Props) {
	const sample = items.length ? items : [
		{ id: "a1", title: "Recorded trade #T-0015", date: "2025-11-25", amount: "5,000 AT" },
		{ id: "a2", title: "Distributed HT to participants", date: "2025-11-24", amount: "150 HT" },
		{ id: "a3", title: "Profit settlement for #T-0013", date: "2025-11-23", amount: "$1,890" },
	];

	return (
		<Card>
			<h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
			<ul className="space-y-3">
				{sample.map((it) => (
					<li key={it.id} className="flex items-center justify-between">
						<div>
							<div className="text-sm font-medium">{it.title}</div>
							<div className="text-xs text-slate-500">{it.date}</div>
						</div>
						{it.amount && <div className="text-sm text-slate-700 font-semibold">{it.amount}</div>}
					</li>
				))}
			</ul>
		</Card>
	);
}
