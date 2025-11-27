import Card from "@/components/ui/Card";

interface Props {
	title: string;
	value: string | number;
	subtitle?: string;
	color?: string;
}

export default function StatsCard({ title, value, subtitle, color = "text-slate-900" }: Props) {
	return (
		<Card className="text-center">
			<div className="text-sm text-slate-600">{title}</div>
			<div className={`text-2xl font-bold ${color}`}>{value}</div>
			{subtitle && <div className="text-sm text-slate-500 mt-1">{subtitle}</div>}
		</Card>
	);
}
