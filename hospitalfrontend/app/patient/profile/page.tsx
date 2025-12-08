'use client'

import { accountInsights, quickLinks } from './data'
import { ProfileOverviewSection } from './info/ProfileOverviewSection'
import { QuickSettingsCard } from './info/QuickSettingsCard'

export default function PatientProfilePage() {
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
