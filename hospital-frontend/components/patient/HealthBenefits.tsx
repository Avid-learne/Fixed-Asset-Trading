import Card from "@/components/ui/Card";

interface Benefit {
	id: string;
	title: string;
	description?: string;
}

export default function HealthBenefits({ items }: { items?: Benefit[] }) {
	const sample: Benefit[] = items ?? [
		{ id: "b1", title: "Free Consultation", description: "Redeem 50 HT for a doctor consultation." },
		{ id: "b2", title: "Diagnostic Voucher", description: "Redeem HT for lab tests and imaging." },
	];

	return (
		<Card>
			<h3 className="text-lg font-semibold mb-4">Health Benefits</h3>
			<ul className="space-y-3">
				{sample.map((b) => (
					<li key={b.id} className="p-3 border border-slate-100 rounded-lg">
						<div className="font-medium">{b.title}</div>
						{b.description && <div className="text-sm text-slate-600">{b.description}</div>}
					</li>
				))}
			</ul>
		</Card>
	);
}
