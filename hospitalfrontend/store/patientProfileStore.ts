// src/store/patientProfileStore.ts
import { create } from 'zustand'

export type PatientProfile = {
  fullName: string
  email: string
  phone: string
  location: string
  bio: string
  avatar: string
  walletAddress: string
  dateOfBirth: string
  bloodGroup: string
  status: string
  profileCompletion: number
}

type PatientProfileState = {
  profile: PatientProfile
  updateProfile: (updates: Partial<PatientProfile>) => void
}

const initialProfile: PatientProfile = {
  fullName: 'John Patient',
  email: 'patient@example.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, USA',
  bio: 'Patient interested in asset-backed health coverage.',
  avatar: '/images/patient-placeholder.png',
  walletAddress: '0x84bF...9A34',
  dateOfBirth: 'June 16, 1993',
  bloodGroup: 'B+',
  status: 'Verified Patient',
  profileCompletion: 82,
}

const calculateCompletion = (profile: PatientProfile): number => {
  const fields: Array<[keyof PatientProfile, boolean]> = [
    ['fullName', Boolean(profile.fullName.trim())],
    ['email', Boolean(profile.email.trim())],
    ['phone', Boolean(profile.phone.trim())],
    ['location', Boolean(profile.location.trim())],
    ['bio', Boolean(profile.bio.trim())],
  ]

  const filled = fields.filter(([, isFilled]) => isFilled).length
  const completion = Math.round((filled / fields.length) * 100)
  return completion
}

export const usePatientProfileStore = create<PatientProfileState>(set => ({
  profile: { ...initialProfile },
  updateProfile: updates =>
    set(state => {
      const merged = { ...state.profile, ...updates }
      return {
        profile: {
          ...merged,
          profileCompletion: calculateCompletion(merged),
        },
      }
    }),
}))
