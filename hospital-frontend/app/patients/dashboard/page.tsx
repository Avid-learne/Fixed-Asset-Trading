// hospital-frontend/app/patients/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TokenBalance from "@/components/dashboard/TokenBalance";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AssetDeposit from "@/components/patient/AssetDeposit";
import HealthBenefits from "@/components/patient/HealthBenefits";

export default function PatientDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== "patient") {
      router.push("/patients/login");
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

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {session?.name || "Patient"}</h1>
        <p className="text-blue-200">Manage your tokenized assets and healthcare benefits</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <TokenBalance at="1,250.00" ht="350.00" />
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Pending Deposits</p>
              <p className="text-3xl font-bold text-amber-600">2</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowDepositModal(true)}
            >
              New Deposit
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <RecentActivity />
        <HealthBenefits />
      </div>

      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Deposit Asset</h3>
              <button onClick={() => setShowDepositModal(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AssetDeposit onDeposit={(data) => {
              console.log("Deposit data:", data);
              setShowDepositModal(false);
            }} />
          </Card>
        </div>
      )}
    </div>
  );
}