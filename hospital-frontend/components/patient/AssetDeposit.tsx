"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AssetDeposit({ onDeposit }: { onDeposit?: (data: any) => void }) {
	const [amount, setAmount] = useState(0);

	function submit(e: React.FormEvent) {
		e.preventDefault();
		onDeposit?.({ amount, date: new Date().toISOString() });
	}

	return (
		<Card>
			<h3 className="text-lg font-semibold mb-4">Deposit Asset Tokens</h3>
			<form onSubmit={submit} className="space-y-4">
				<Input label="Amount (AT)" type="number" value={String(amount)} onChange={(e) => setAmount(Number(e.target.value))} />
				<div className="flex gap-3">
					<Button type="button" variant="outline">Cancel</Button>
					<Button type="submit" variant="primary">Deposit</Button>
				</div>
			</form>
		</Card>
	);
}
