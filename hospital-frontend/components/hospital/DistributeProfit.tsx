"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function DistributeProfit({ onSubmit }: { onSubmit?: (data: any) => void }) {
	const [tradeId, setTradeId] = useState("");
	const [recipients, setRecipients] = useState("");

	function submit(e: React.FormEvent) {
		e.preventDefault();
		const data = { tradeId, recipients };
		onSubmit?.(data);
	}

	return (
		<Card>
			<h3 className="text-lg font-semibold mb-4">Distribute Health Tokens</h3>
			<form onSubmit={submit} className="space-y-4">
				<Input label="Trade ID" value={tradeId} onChange={(e) => setTradeId(e.target.value)} />
				<div>
					<label className="block text-sm font-medium text-slate-700 mb-1">Recipients (address:amount)</label>
					<textarea
						className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows={5}
						value={recipients}
						onChange={(e) => setRecipients(e.target.value)}
						placeholder="0xabc...:100\n0xdef...:150"
					/>
				</div>
				<div className="flex gap-3">
					<Button type="button" variant="outline">Cancel</Button>
					<Button type="submit" variant="secondary">Distribute HT</Button>
				</div>
			</form>
		</Card>
	);
}
