// src/store/patientProfileStore.ts
import { create } from 'zustand'
import { StoredAuthUser } from '@/lib/authService'

export type PatientProfile = {
  fullName: string
  email: string
  cnic: string
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
  cnic: '',
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
    ['cnic', Boolean(profile.cnic.trim())],
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
      const userAny = user as any

      const merged: PatientProfile = {
        ...state.profile,
        fullName: userAny.name || state.profile.fullName,
        email: userAny.email || state.profile.email,
        cnic: userAny.cnic || state.profile.cnic,
        phone: userAny.phoneNum || state.profile.phone,
        city: userAny.city || state.profile.city,
        address: userAny.address || state.profile.address,
        bloodGroup: userAny.bloodGroup || state.profile.bloodGroup,
        dateOfBirth: userAny.dateOfBirth || state.profile.dateOfBirth,
        walletAddress: userAny.walletAddress || state.profile.walletAddress,
        affiliatedHospital: userAny.hospitalName || userAny.hospitalId || state.profile.affiliatedHospital,
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
