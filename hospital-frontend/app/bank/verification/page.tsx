// hospital-frontend/app/bank/verification/page.tsx
"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function BankVerificationPage() {
  const [pendingRequests] = useState([
    { id: 1, patient: "0x742d...4e8f", asset: "Gold Jewelry", value: "5,000", date: "2025-11-25" },
    { id: 2, patient: "0x9a3c...7d2b", asset: "Property Deed", value: "50,000", date: "2025-11-24" },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Asset Verification</h1>
        <p className="text-slate-600">Review and verify patient asset deposits</p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Pending Verification Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Patient</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Asset</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Value (USD)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request) => (
                <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-mono">{request.patient}</td>
                  <td className="py-3 px-4 text-sm">{request.asset}</td>
                  <td className="py-3 px-4 text-sm font-medium">${request.value}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{request.date}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedRequest && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Verify Asset: {selectedRequest.asset}</h3>
          <div className="space-y-4">
            <Input label="Verified Value (USD)" type="number" defaultValue={selectedRequest.value} />
            <Input label="Asset Tokens to Mint" type="number" defaultValue={selectedRequest.value} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Verification Notes
              </label>
              <textarea
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add verification notes..."
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button variant="danger">Reject</Button>
              <Button variant="primary">Approve & Mint Tokens</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}