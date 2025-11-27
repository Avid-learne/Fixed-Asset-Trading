"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

export default function BankPage() {
  const [pendingRequests] = useState([
    { id: 1, patient: "0x742d...4e8f", asset: "Gold Jewelry", value: "5,000", date: "2025-11-25" },
    { id: 2, patient: "0x9a3c...7d2b", asset: "Property Deed", value: "50,000", date: "2025-11-24" },
    { id: 3, patient: "0x1f8e...3c9a", asset: "Vehicle", value: "15,000", date: "2025-11-23" },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bank Dashboard</h1>
        <p className="text-slate-600">Verify deposits and mint asset tokens</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Requests</p>
              <p className="text-3xl font-bold text-amber-600">3</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Verified Today</p>
              <p className="text-3xl font-bold text-green-600">7</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total AT Minted</p>
              <p className="text-3xl font-bold text-blue-600">125,500</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Pending Deposit Requests</h2>
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
                      onClick={() => setSelectedRequest(request.id)}
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

      {/* Verification Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">Verify Asset Deposit</h3>
              <button onClick={() => setSelectedRequest(null)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Asset Details */}
              <div>
                <h4 className="font-semibold mb-3">Asset Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Patient Address</p>
                    <p className="font-mono text-sm">0x742d...4e8f</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Asset Type</p>
                    <p className="text-sm">Gold Jewelry</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Estimated Value</p>
                    <p className="text-sm font-semibold">$5,000</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Deposit ID</p>
                    <p className="font-mono text-sm">DEP-2025-001</p>
                  </div>
                </div>
              </div>

              {/* Verification Form */}
              <div>
                <h4 className="font-semibold mb-3">Verification</h4>
                <div className="space-y-4">
                  <Input
                    label="Verified Value (USD)"
                    type="number"
                    placeholder="5000"
                    defaultValue="5000"
                  />
                  <Input
                    label="Asset Tokens to Mint"
                    type="number"
                    placeholder="5000"
                    defaultValue="5000"
                  />
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
                  <Input
                    label="IPFS Metadata Hash"
                    placeholder="QmX..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </Button>
                <Button variant="danger" className="flex-1">
                  Reject
                </Button>
                <Button variant="primary" className="flex-1">
                  Approve & Mint AT
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}