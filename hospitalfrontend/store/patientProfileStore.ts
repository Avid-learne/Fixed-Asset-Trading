// src/store/patientProfileStore.ts
import { create } from 'zustand'
import { StoredAuthUser } from '@/lib/authService'

export type PatientProfile = {
  fullName: string
  email: string
  phone: string
  city: string
  address: string
  avatar: string
  walletAddress: string
  dateOfBirth: string
  bloodGroup: string
  affiliatedHospital: string
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
  city: '',
  address: '',
  avatar: '/images/patient-placeholder.png',
  walletAddress: '',
  dateOfBirth: '',
  bloodGroup: '',
  affiliatedHospital: '',
  status: 'Verified Patient',
  profileCompletion: 0,
}

const calculateCompletion = (profile: PatientProfile): number => {
  const fields: Array<[keyof PatientProfile, boolean]> = [
    ['fullName', Boolean(profile.fullName.trim())],
    ['email', Boolean(profile.email.trim())],
    ['phone', Boolean(profile.phone.trim())],
    ['city', Boolean(profile.city.trim())],
    ['address', Boolean(profile.address.trim())],
    ['bloodGroup', Boolean(profile.bloodGroup.trim())],
    ['dateOfBirth', Boolean(profile.dateOfBirth.trim())],
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
        city: user.city || state.profile.city,
        address: user.address || state.profile.address,
        bloodGroup: user.bloodGroup || state.profile.bloodGroup,
        dateOfBirth: user.dateOfBirth || state.profile.dateOfBirth,
        walletAddress: (user as any).walletAddress || state.profile.walletAddress,
        affiliatedHospital: user.hospitalName || user.hospitalId || state.profile.affiliatedHospital,
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
