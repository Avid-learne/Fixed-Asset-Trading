"use client";

import { useSidebar } from "@/lib/useSidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSession, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/lib/useWeb3";

function ConnectWalletButton() {
  const { address, connect, disconnect } = useWeb3();

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  if (address) {
    return (
      <button
        onClick={() => disconnect()}
        className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-sm border border-slate-200"
        title={address}
      >
        {short}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect().catch(() => {})}
      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
    >
      Connect Wallet
    </button>
  );
}

export default function Header() {
  const router = useRouter();
    const { toggleSidebar } = useSidebar();
  const [session, setSession] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      patient: 'Patient',
      bank: 'Bank',
      hospital: 'Hospital',
    };
    return roles[role] || role;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm h-16">
      <nav className="h-full">
        <div className="flex items-center justify-between h-full px-4">
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors mr-2"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center group-hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-slate-900 hidden sm:block">
              Hospital Asset Platform
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {session ? (
              <>
                <Link
                  href={session.role === "patient" ? "/patients" : `/${session.role}`}
                  className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
                
                {/* User Info */}
                <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{session.name || "User"}</p>
                    <p className="text-xs text-slate-500">{getRoleName(session.role)}</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">
                      {(session.name || session.address || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Register
                </Link>
                <ConnectWalletButton />
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 animate-fade-in">
            {session ? (
              <div className="space-y-3">
                <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-900">{session.name || "User"}</p>
                  <p className="text-xs text-slate-500 mt-1">{getRoleName(session.role)}</p>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {session.address?.slice(0, 6)}...{session.address?.slice(-4)}
                  </p>
                </div>
                <Link
                  href={session.role === "patient" ? "/patients" : `/${session.role}`}
                  className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}