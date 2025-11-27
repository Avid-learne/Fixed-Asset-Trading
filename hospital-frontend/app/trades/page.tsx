"use client";

import TradeList from "@/components/trades/TradeList";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useState } from "react";

export default function TradesPage() {
  const [trades] = useState([
    { id: "#T-0015", at: "5,000 AT", profit: "$1,250", date: "2025-11-25", status: "Completed" },
    { id: "#T-0014", at: "10,000 AT", profit: "$2,800", date: "2025-11-24", status: "Distributed" },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Trade History</h1>
        <p className="text-slate-600">All recorded trades and their profit distribution</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recorded Trades</h2>
          <div className="flex gap-2">
            <Button variant="outline">Export CSV</Button>
            <Button variant="primary">New Trade</Button>
          </div>
        </div>
        <TradeList items={trades} />
      </Card>
    </div>
  );
}
