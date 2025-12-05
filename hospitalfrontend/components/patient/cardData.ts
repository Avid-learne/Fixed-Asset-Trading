export type CardInfo = {
  name: string
  number: string
  expiry: string
  balance: number
  walletNumber: string
  securityKey: string
  issuedYear?: string
}

export const DEFAULT_CARD: CardInfo = {
  name: 'John Doe',
  number: '4123 4567 8901 2345',
  expiry: '12/28',
  balance: 50000,
  walletNumber: 'WLT-2025-0001',
  securityKey: 'SEC-9X7B-44QH',
  issuedYear: '2025',
}

export default DEFAULT_CARD
