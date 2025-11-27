// hospital-frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { Web3Provider } from "@/lib/useWeb3";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hospital Asset Trading Platform",
  description: "Blockchain-based hospital asset tokenization and trading system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Web3Provider>
            <Header />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
            <Footer />
          </Web3Provider>
        </div>
      </body>
    </html>
  );
}