// Short overview: Central mock data and small fetch-style helpers for Activity page.
// - Exports mock transactions, notifications, statements.
// - Exports simple getters used by the Activity page and extracted components.
// Relation: Used by `app/patient/activity/page.tsx` and components under `components/patient/`.
import { Tx, NotificationItem, StatementItem } from "@/types/activity"

export const MOCK_TX: Tx[] = [
  {
    id: "1",
    date: "2025-11-28",
    description: "Purchased AT (gold backing) — buy 500 AT",
    amount: -100000,
    balance: 900000,
    type: "debit",
    status: "success",
    txHash: "0xabc123",
    asset: "gold",
    assetRate: 185000,
    assetUnits: 0.54,
    atTokens: 500,
    htUsed: 10,
    convertedValue: 100000,
    profit: 0,
    hospitalInvestor: true,
  },
  {
    id: "2",
    date: "2025-11-25",
    description: "Sold 300 AT — received cash",
    amount: 60000,
    balance: 960000,
    type: "credit",
    status: "success",
    txHash: "0xdef456",
    asset: "gold",
    assetRate: 187000,
    assetUnits: 0.32,
    atTokens: -300,
    htUsed: 0,
    convertedValue: 60000,
    profit: 4500,
    hospitalInvestor: false,
  },
  {
    id: "3",
    date: "2025-10-30",
    description: "AT staking reward",
    amount: 5000,
    balance: 965000,
    type: "credit",
    status: "success",
    asset: "fixed-asset",
    atTokens: 50,
    htUsed: 0,
    convertedValue: 5000,
    profit: 5000,
    hospitalInvestor: false,
  },
  {
    id: "4",
    date: "2025-10-15",
    description: "Converted 200 AT → HT (platform usage)",
    amount: -20000,
    balance: 945000,
    type: "debit",
    status: "success",
    atTokens: -200,
    htUsed: 150,
    convertedValue: 20000,
    profit: -200,
    hospitalInvestor: false,
  },
  {
    id: "5",
    date: "2025-09-20",
    description: "HT airdrop reward (platform incentive)",
    amount: 1200,
    balance: 946200,
    type: "credit",
    status: "success",
    atTokens: 0,
    htUsed: 0,
    convertedValue: 1200,
    profit: 1200,
    hospitalInvestor: false,
  },
  {
    id: "6",
    date: "2025-09-18",
    description: "Transaction fee — marketplace",
    amount: -250,
    balance: 945950,
    type: "debit",
    status: "success",
    htUsed: 5,
    convertedValue: 250,
    profit: 0,
    hospitalInvestor: false,
  },
]

export const MOCK_NOTIFS: NotificationItem[] = [
  { id: "n1", title: "Payment received", body: "You received 200 PKR from Ali.", date: "2025-11-30", txHash: "0xabc123" },
  { id: "n2", title: "Statement ready", body: "Your Oct 2025 statement is ready to download.", date: "2025-11-01", statementHref: "#" },
]

export const MOCK_STATEMENTS: StatementItem[] = [
  { id: "s1", title: "November 2025", href: "#" },
  { id: "s2", title: "October 2025", href: "#" },
]

export function getTransactions() {
  // In a real app this would call an API. Keep synchronous for now.
  return MOCK_TX
}

export function getNotifications() {
  return MOCK_NOTIFS
}

export function getStatements() {
  return MOCK_STATEMENTS
}
