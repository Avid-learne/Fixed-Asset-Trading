// src/store/patientProfileStore.ts
import { create } from 'zustand'
import { StoredAuthUser } from '@/lib/authService'

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
  hydrateFromAuthUser: (user: StoredAuthUser | null) => void
}

const initialProfile: PatientProfile = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  avatar: '/images/patient-placeholder.png',
  walletAddress: '',
  dateOfBirth: '',
  bloodGroup: '',
  status: 'Verified Patient',
  profileCompletion: 0,
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
  hydrateFromAuthUser: user =>
    set(state => {
      if (!user) {
        return state
      }

      const merged: PatientProfile = {
        ...state.profile,
        fullName: user.name || state.profile.fullName,
        email: user.email || state.profile.email,
        phone: user.phoneNum || state.profile.phone,
        location: [user.city, user.address].filter(Boolean).join(', ') || state.profile.location,
        bloodGroup: user.bloodGroup || state.profile.bloodGroup,
        dateOfBirth: user.dateOfBirth || state.profile.dateOfBirth,
        status: state.profile.status || 'Verified Patient',
      }

      return {
        profile: {
          ...merged,
          profileCompletion: calculateCompletion(merged),
        },
      }
    }),
}))
