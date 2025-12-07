// Short overview: Domain types used by the patient Activity UI.
// - `Tx` represents a transaction with AT/HT domain fields.
// - `NotificationItem` and `StatementItem` represent notifications and statements.
// Relation: imported by activity components and the activity page.
export type Tx = {
  id: string
  date: string
  description: string
  amount: number
  balance: number
  type: "credit" | "debit"
  status: "success" | "pending" | "failed"
  txHash?: string
  asset?: string
  assetRate?: number
  assetUnits?: number
  atTokens?: number
  htUsed?: number
  convertedValue?: number
  profit?: number
  hospitalInvestor?: boolean
}

export type NotificationItem = {
  id: string
  title: string
  body: string
  date: string
  txHash?: string
  statementHref?: string
}

export type StatementItem = {
  id: string
  title: string
  href: string
}
