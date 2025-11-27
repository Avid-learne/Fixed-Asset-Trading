"use client";

import Card from "@/components/ui/Card";

interface Props {
	symbol?: string;
	name?: string;
	balance?: string | number;
}

export default function MinAssetToken({ symbol = "AT", name = "Asset Token", balance = "0" }: Props) {
	return (
		<Card className="flex items-center gap-4">
			<div className="w-12 h-12 rounded-md bg-blue-600 text-white flex items-center justify-center font-semibold">
				{symbol}
			</div>
			<div>
				<div className="text-sm text-slate-600">{name}</div>
				<div className="text-lg font-bold">{balance} {symbol}</div>
			</div>
		</Card>
	);
}
