'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { accountInsights, quickLinks } from './data'
import { ProfileOverviewSection } from './info/ProfileOverviewSection'
import { QuickSettingsCard } from './info/QuickSettingsCard'
import { KycStatusSection } from './kyc/KycStatusSection'
import { usePatientProfileStore } from '@/store/patientProfileStore'
import { profileService } from '@/services/profileService'
import { authService } from '@/lib/authService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { kycStatus } from './data'

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
          cnic: profileData.cnic || '',
          phone: profileData.phoneNum || '',
          city: profileData.city || '',
          address: profileData.address || '',
          bloodGroup: profileData.bloodGroup || '',
          dateOfBirth: formattedDob,
          walletAddress: profileData.walletAddress || '',
          affiliatedHospital: profileData.hospitalName || user.hospitalName || user.hospitalId || '',
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[480px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="basic">Basic Profile</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <ProfileOverviewSection insights={accountInsights} />
            <QuickSettingsCard links={quickLinks} />
          </div>
        </TabsContent>

        <TabsContent value="basic" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Basic Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal and contact details here. CNIC, phone, address, city, and date of birth are used for KYC.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Open the detailed form to edit your contact and identity data.</p>
                <Link href="/patient/profile/info" className="inline-flex rounded-md border px-3 py-2 font-medium hover:bg-muted">
                  Open Basic Profile Form
                </Link>
              </CardContent>
            </Card>
            <QuickSettingsCard links={quickLinks} />
          </div>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <KycStatusSection items={kycStatus} />
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>KYC Submission</CardTitle>
                <CardDescription>
                  Review your profile details, then open the KYC page to submit for approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>KYC stays separate from basic profile settings so patients can manage contact data without losing the compliance flow.</p>
                <Link href="/patient/profile/kyc" className="inline-flex rounded-md border px-3 py-2 font-medium hover:bg-muted">
                  Open KYC Submission Page
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
