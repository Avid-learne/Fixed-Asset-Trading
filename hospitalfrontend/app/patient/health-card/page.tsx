'use client'

import React from 'react'
import { QRCodeCard } from '@/components/patient/QRCodeCard'

export default function HealthCardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Health Card</h1>
      <QRCodeCard />
    </div>
  )
}
