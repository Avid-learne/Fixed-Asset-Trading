import MainContent from "@/components/layout/MainContent";
// hospital-frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { Web3Provider } from "@/lib/useWeb3";
import { SidebarProvider } from "@/lib/useSidebar";

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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-secondary)' }}>
          <Web3Provider>
            <SidebarProvider>
              <Header />
              <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                <Sidebar />
                <MainContent>{children}</MainContent>
              </div>
              <Footer />
            </SidebarProvider>
          </Web3Provider>
        </div>
      </body>
    </html>
  );
}