// hospital-frontend/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSession } from "@/lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const session = getSession();

  if (!session) return null;

  const patientMenu = [
    { name: "Dashboard", href: "/patients", icon: "📊" },
    { name: "Deposit Assets", href: "/patients/deposit", icon: "💰" },
    { name: "My Benefits", href: "/patients/benefits", icon: "🏥" },
    { name: "Transaction History", href: "/patients/history", icon: "📝" },
  ];

  const hospitalMenu = [
    { name: "Dashboard", href: "/hospital", icon: "📊" },
    { name: "Trading", href: "/hospital/trading", icon: "📈" },
    { name: "Asset Management", href: "/hospital/assets", icon: "💼" },
    { name: "Profit Distribution", href: "/hospital/distribution", icon: "🤝" },
  ];

  const bankMenu = [
    { name: "Dashboard", href: "/bank", icon: "📊" },
    { name: "Pending Requests", href: "/bank/requests", icon: "⏳" },
    { name: "Asset Verification", href: "/bank/verification", icon: "✅" },
    { name: "Token Management", href: "/bank/tokens", icon: "🪙" },
  ];

  const menuItems = session.role === "patient" ? patientMenu : 
                   session.role === "hospital" ? hospitalMenu : bankMenu;

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 capitalize">
          {session.role} Portal
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Welcome, {session.name || session.address}
        </p>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}