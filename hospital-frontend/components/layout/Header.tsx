"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">
              Hospital Asset Trading
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/patients" className="text-slate-600 hover:text-blue-600 transition-colors">
              Patients
            </Link>
            <Link href="/bank" className="text-slate-600 hover:text-blue-600 transition-colors">
              Bank
            </Link>
            <Link href="/hospital" className="text-slate-600 hover:text-blue-600 transition-colors">
              Hospital
            </Link>
            <Link href="/trades" className="text-slate-600 hover:text-blue-600 transition-colors">
              Trades
            </Link>
            <Button variant="primary" size="sm">
              Connect Wallet
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <Link href="/patients" className="block text-slate-600 hover:text-blue-600 transition-colors py-2">
              Patients
            </Link>
            <Link href="/bank" className="block text-slate-600 hover:text-blue-600 transition-colors py-2">
              Bank
            </Link>
            <Link href="/hospital" className="block text-slate-600 hover:text-blue-600 transition-colors py-2">
              Hospital
            </Link>
            <Link href="/trades" className="block text-slate-600 hover:text-blue-600 transition-colors py-2">
              Trades
            </Link>
            <Button variant="primary" size="sm" className="w-full">
              Connect Wallet
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}