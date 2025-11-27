// hospital-frontend/app/patients/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

export default function PatientsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [atBalance] = useState("1,250.00");
  const [htBalance] = useState("350.00");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== "patient") {
      router.push("/login");
      return;
    }
    setSession(currentSession);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const recentTransactions = [
    { id: 1, type: "Deposit", amount: "500 AT", date: "2025-11-20", status: "Completed" },
    { id: 2, type: "Received", amount: "50 HT", date: "2025-11-18", status: "Completed" },
    { id: 3, type: "Deposit", amount: "750 AT", date: "2025-11-15", status: "Pending" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {session?.name || "Patient"}</h1>
        <p className="text-slate-300">Manage your tokenized assets and healthcare benefits</p>
      </div>

      {/* Token Balances */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2 font-medium">Asset Token (AT)</p>
              <p className="text-4xl font-bold text-slate-900 mb-1">{atBalance}</p>
              <p className="text-xs text-slate-500">Represents your deposited assets</p>
            </div>
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2 font-medium">Health Token (HT)</p>
              <p className="text-4xl font-bold text-emerald-600 mb-1">{htBalance}</p>
              <p className="text-xs text-slate-500">Redeemable for healthcare benefits</p>
            </div>
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            variant="primary"
            className="w-full h-14 text-base"
            onClick={() => setIsDepositModalOpen(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Deposit Asset
          </Button>
          <Button variant="secondary" className="w-full h-14 text-base">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Redeem Benefits
          </Button>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm">{tx.type}</td>
                  <td className="py-3 px-4 text-sm font-medium">{tx.amount}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{tx.date}</td>
                  <td className="py-3 px-4">
                    <Badge variant={tx.status === "Completed" ? "success" : "warning"}>
                      {tx.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Deposit Asset</h3>
              <button onClick={() => setIsDepositModalOpen(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="space-y-4">
              <Input label="Asset Description" placeholder="e.g., Gold jewelry, 24 carat" />
              <Input label="Estimated Value (USD)" type="number" placeholder="e.g., 5000" />
              <Input label="Asset ID / Reference" placeholder="e.g., GLD-2025-001" />
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDepositModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1">
                  Submit Request
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}