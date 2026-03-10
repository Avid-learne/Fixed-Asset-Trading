'use client'

import { useEffect } from 'react'
import { accountInsights, quickLinks } from './data'
import { ProfileOverviewSection } from './info/ProfileOverviewSection'
import { QuickSettingsCard } from './info/QuickSettingsCard'
import { usePatientProfileStore } from '@/store/patientProfileStore'
import { profileService } from '@/services/profileService'
import { authService } from '@/lib/authService'

export default function PatientProfilePage() {
  const { updateProfile } = usePatientProfileStore()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = authService.getUser()
        if (!user || !user.id) {
          console.error('User not authenticated')
          return
        }

        // Fetch profile from backend
        const profileData = await profileService.getProfile(user.id)
        
        // Format date of birth if available
        let formattedDob = ''
        if (profileData.dateOfBirth) {
          const date = new Date(profileData.dateOfBirth)
          formattedDob = date.toISOString().split('T')[0]
        }

        // Update the profile store
        updateProfile({
          fullName: profileData.name,
          email: profileData.email,
          phone: profileData.phoneNum || '',
          location: [profileData.city, profileData.address].filter(Boolean).join(', '),
          bloodGroup: profileData.bloodGroup || '',
          dateOfBirth: formattedDob,
          bio: profileData.bio || '',
          walletAddress: profileData.walletAddress || '',
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [updateProfile])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          View your personal details, wallet information, and update key settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ProfileOverviewSection insights={accountInsights} />
        <QuickSettingsCard links={quickLinks} />
      </div>
    </div>
  )
}
