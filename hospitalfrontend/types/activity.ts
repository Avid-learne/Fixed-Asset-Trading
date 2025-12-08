// Short overview: Domain types used by the patient Activity UI.
// - `Tx` represents a transaction with AT/HT domain fields.
// - `NotificationItem` and `StatementItem` represent notifications and statements.
// Relation: imported by activity components and the activity page.
export type Tx = {
  id: string
  token_type: "AT" | "HT"
  created_at: string
  status: "success" | "pending" | "failed"
  amount: number
  
  // AT-specific fields
  transaction_hash?: string
  from_address?: string
  to_address?: string
  token_id?: string
  gas_used?: number
  
  // HT-specific fields
  patient_id?: string
  patient_address?: string
  type?: "ISSUED" | "REDEEMED" | "ALLOCATED" | "TRADING_PROFIT"
  source?: string
  block_number?: number
}

export type NotificationItem = {
  id: string
  title: string
  body: string
  date: string
  type: "success" | "info" | "warning" | "error"
  relativeTime: string
  txHash?: string
  statementHref?: string
}

export type StatementItem = {
  id: string
  month: string
  year: number
  transactions: number
  totalAT: number
  totalHT: number
  generatedDate: string
}
