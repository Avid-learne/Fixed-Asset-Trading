"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RecordTrade({ onSubmit }: { onSubmit?: (data: any) => void }) {
	const [at, setAt] = useState(0);
	const [profit, setProfit] = useState(0);

	function submit(e: React.FormEvent) {
		e.preventDefault();
		const data = { at, profit, date: new Date().toISOString() };
		onSubmit?.(data);
	}

	return (
		<Card>
			<h3 className="text-lg font-semibold mb-4">Record New Trade</h3>
			<form onSubmit={submit} className="space-y-4">
				<Input label="Asset Tokens Invested" type="number" value={String(at)} onChange={(e) => setAt(Number(e.target.value))} />
				<Input label="Profit Earned (USD)" type="number" value={String(profit)} onChange={(e) => setProfit(Number(e.target.value))} />
				<div className="flex gap-3">
					<Button type="button" variant="outline">Cancel</Button>
					<Button type="submit" variant="primary">Record Trade</Button>
				</div>
			</form>
		</Card>
	);
}
