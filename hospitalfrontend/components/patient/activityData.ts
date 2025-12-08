// Short overview: Central mock data and small fetch-style helpers for Activity page.
// - Exports mock transactions, notifications, statements.
// - Exports simple getters used by the Activity page and extracted components.
// Relation: Used by `app/patient/activity/page.tsx` and components under `components/patient/`.
import { Tx, NotificationItem, StatementItem } from "@/types/activity"

export const MOCK_TX: Tx[] = [
  {
    id: "1",
    token_type: "AT",
    created_at: "2025-12-04",
    status: "success",
    amount: 500,
    transaction_hash: "0xabc123def456789",
    from_address: "0xHospitalAdmin123",
    to_address: "0x123patient456",
    token_id: "AT-001",
    gas_used: 21000,
  },
  {
    id: "2",
    token_type: "AT",
    created_at: "2025-12-03",
    status: "success",
    amount: -200,
    transaction_hash: "0xdef456abc789123",
    from_address: "0x123patient456",
    to_address: "0x789trader000",
    token_id: "AT-001",
    gas_used: 21000,
  },
  {
    id: "3",
    token_type: "AT",
    created_at: "2025-12-02",
    status: "success",
    amount: 300,
    transaction_hash: "0x789abc123def456",
    from_address: "0xMinter999",
    to_address: "0x123patient456",
    token_id: "AT-002",
    gas_used: 45000,
  },
  {
    id: "4",
    token_type: "HT",
    created_at: "2025-12-05",
    status: "success",
    amount: -50,
    patient_id: "PAT001",
    patient_address: "0x123patient456",
    type: "REDEEMED",
    source: "Dental checkup benefit",
    transaction_hash: "0xabc123redeem",
    block_number: 12345,
  },
  {
    id: "5",
    token_type: "HT",
    created_at: "2025-12-04",
    status: "success",
    amount: 100,
    patient_id: "PAT001",
    patient_address: "0x123patient456",
    type: "TRADING_PROFIT",
    source: "Asset trading profit",
    transaction_hash: "0xdef456profit",
    block_number: 12346,
  },
  {
    id: "6",
    token_type: "HT",
    created_at: "2025-12-03",
    status: "success",
    amount: 150,
    patient_id: "PAT001",
    patient_address: "0x123patient456",
    type: "ISSUED",
    source: "Initial issuance",
    transaction_hash: "0x789abcissue",
    block_number: 12347,
  },
  {
    id: "7",
    token_type: "HT",
    created_at: "2025-12-02",
    status: "success",
    amount: 25,
    patient_id: "PAT001",
    patient_address: "0x123patient456",
    type: "ALLOCATED",
    source: "Hospital allocation",
    transaction_hash: "0x789abcalloc",
    block_number: 12348,
  },
]

export const MOCK_NOTIFS: NotificationItem[] = [
  { 
    id: "n1", 
    title: "Asset Approved", 
    body: "Your car deposit has been approved. 500 tokens added to your account.", 
    date: "2025-11-30",
    type: "success",
    relativeTime: "1 years ago",
    txHash: "0xabc123" 
  },
  { 
    id: "n2", 
    title: "New Benefit Available", 
    body: "Premium dental checkup is now available for redemption.", 
    date: "2025-11-01",
    type: "info",
    relativeTime: "1 years ago"
  },
  { 
    id: "n3", 
    title: "Document Required", 
    body: "Please upload additional documents for your property deposit.", 
    date: "2025-10-15",
    type: "warning",
    relativeTime: "1 years ago"
  },
  { 
    id: "n4", 
    title: "Transaction Completed", 
    body: "Your token transfer to Medical Services has been completed.", 
    date: "2025-10-01",
    type: "success",
    relativeTime: "1 years ago",
    txHash: "0xdef456"
  },
]

export const MOCK_STATEMENTS: StatementItem[] = [
  { 
    id: "s1", 
    month: "December", 
    year: 2025, 
    transactions: 7,
    totalAT: 600,
    totalHT: 225,
    generatedDate: "2025-12-08"
  },
  { 
    id: "s2", 
    month: "November", 
    year: 2025, 
    transactions: 12,
    totalAT: 1200,
    totalHT: 350,
    generatedDate: "2025-12-01"
  },
  { 
    id: "s3", 
    month: "October", 
    year: 2025, 
    transactions: 8,
    totalAT: 450,
    totalHT: 180,
    generatedDate: "2025-11-01"
  },
  { 
    id: "s4", 
    month: "September", 
    year: 2025, 
    transactions: 15,
    totalAT: 800,
    totalHT: 420,
    generatedDate: "2025-10-01"
  },
  { 
    id: "s5", 
    month: "August", 
    year: 2025, 
    transactions: 10,
    totalAT: 950,
    totalHT: 280,
    generatedDate: "2025-09-01"
  },
  { 
    id: "s6", 
    month: "July", 
    year: 2025, 
    transactions: 6,
    totalAT: 300,
    totalHT: 150,
    generatedDate: "2025-08-01"
  },
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
