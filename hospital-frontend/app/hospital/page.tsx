"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function HospitalPage() {
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Hospital Dashboard</h1>
        <p className="text-slate-600">Manage trades and distribute health benefits</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-slate-600">Total AT Pool</p>
          <p className="text-2xl font-bold text-blue-600">125,500</p>
        </Card>

        <Card>
          <p className="text-sm text-slate-600">Active Trades</p>
          <p className="text-2xl font-bold text-amber-600">12</p>
        </Card>

        <Card>
          <p className="text-sm text-slate-600">Total Profit</p>
          <p className="text-2xl font-bold text-green-600">$45,280</p>
        </Card>

        <Card>
          <p className="text-sm text-slate-600">HT Distributed</p>
          <p className="text-2xl font-bold text-purple-600">15,300</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setShowTradeModal(true)}
          >
            Record New Trade
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setShowDistributeModal(true)}
          >
            Distribute Health Tokens
          </Button>
        </div>
      </Card>

      {/* Recent Trades */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Recent Trades</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Trade ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">AT Invested</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Profit Earned</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm font-mono">#T-0015</td>
                <td className="py-3 px-4 text-sm">5,000 AT</td>
                <td className="py-3 px-4 text-sm font-medium text-green-600">$1,250</td>
                <td className="py-3 px-4 text-sm text-slate-600">2025-11-25</td>
                <td className="py-3 px-4 text-sm">Completed</td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm font-mono">#T-0014</td>
                <td className="py-3 px-4 text-sm">10,000 AT</td>
                <td className="py-3 px-4 text-sm font-medium text-green-600">$2,800</td>
                <td className="py-3 px-4 text-sm text-slate-600">2025-11-24</td>
                <td className="py-3 px-4 text-sm">Distributed</td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm font-mono">#T-0013</td>
                <td className="py-3 px-4 text-sm">7,500 AT</td>
                <td className="py-3 px-4 text-sm font-medium text-green-600">$1,890</td>
                <td className="py-3 px-4 text-sm text-slate-600">2025-11-23</td>
                <td className="py-3 px-4 text-sm">Distributed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Record New Trade</h3>
              <button onClick={() => setShowTradeModal(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="space-y-4">
              <Input
                label="Asset Tokens Invested"
                type="number"
                placeholder="e.g., 5000"
              />
              <Input
                label="Profit Earned (USD)"
                type="number"
                placeholder="e.g., 1250"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Trade Notes
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add trade details..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowTradeModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1">
                  Record Trade
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Distribute HT Modal */}
      {showDistributeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Distribute Health Tokens</h3>
              <button onClick={() => setShowDistributeModal(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="Select Trade"
                type="text"
                placeholder="Trade ID"
                defaultValue="#T-0015"
              />
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Trade Details:</strong> AT Invested: 5,000 | Profit: $1,250
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Recipients (Address:Amount)
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={5}
                  placeholder="0x742d...4e8f:100&#10;0x9a3c...7d2b:150&#10;0x1f8e...3c9a:75"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDistributeModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="secondary" className="flex-1">
                  Distribute HT
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}