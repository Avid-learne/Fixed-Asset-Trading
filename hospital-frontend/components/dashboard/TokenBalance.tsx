import Card from "@/components/ui/Card";

interface Props {
	at?: number | string;
	ht?: number | string;
}

export default function TokenBalance({ at = 0, ht = 0 }: Props) {
	return (
		<Card>
			<div className="flex items-center justify-between">
				<div>
					<div className="text-sm text-slate-600">Asset Tokens (AT)</div>
					<div className="text-lg font-bold">{at}</div>
				</div>
				<div>
					<div className="text-sm text-slate-600">Health Tokens (HT)</div>
					<div className="text-lg font-bold text-purple-600">{ht}</div>
				</div>
			</div>
		</Card>
	);
}
