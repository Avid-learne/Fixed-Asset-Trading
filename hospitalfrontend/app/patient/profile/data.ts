import { FileText, Shield, User } from 'lucide-react'

type LucideIcon = typeof FileText

export type PatientProfile = {
  fullName: string
  avatar: string
  walletAddress: string
  email: string
  phone: string
  location: string
  dateOfBirth: string
  bloodGroup: string
  status: string
  profileCompletion: number
}

export const patientProfile: PatientProfile = {
  fullName: 'Ahmed Patient',
  avatar: '/images/patient-placeholder.png',
  walletAddress: '0x84bF...9A34',
  email: 'ahmed.patient@lnh.com',
  phone: '+92 300 1234567',
  location: 'Karachi, Pakistan',
  dateOfBirth: 'June 16, 1993',
  bloodGroup: 'B+',
  status: 'Verified Patient',
  profileCompletion: 82,
}

export type QuickLink = {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export const quickLinks: QuickLink[] = [
  {
    title: 'Personal Information',
    description: 'Update your personal and contact details.',
    href: '/patient/profile/info',
    icon: User,
  },
  {
    title: 'Security Settings',
    description: 'Manage passwords, 2FA, and device logins.',
    href: '/patient/settings?tab=security',
    icon: Shield,
  },
  {
    title: 'Verification & KYC',
    description: 'Review and upload compliance documents.',
    href: '/patient/profile/kyc',
    icon: FileText,
  },
]

export type AccountInsight = {
  label: string
  value: string
  tone?: 'default' | 'warning'
}

export const accountInsights: AccountInsight[] = [
  { label: 'Verified documents', value: '4 / 5' },
  { label: 'Hospital partners', value: '3 active' },
  { label: 'Pending requests', value: '1 requires action', tone: 'warning' },
]

export type KycStatusEntry = {
  title: string
  description: string
  status: 'verified' | 'pending' | 'required'
}

export const kycStatus: KycStatusEntry[] = [
  {
    title: 'Identity Document',
    description: 'National ID uploaded and verified by compliance team.',
    status: 'verified',
  },
  {
    title: 'Proof of Address',
    description: 'Recent utility bill pending manual review.',
    status: 'pending',
  },
  {
    title: 'Financial Source Declaration',
    description: 'Submit supporting income documents to finalise verification.',
    status: 'required',
  },
]
