'use client'

import React from 'react'
import DigitalCard from '@/components/patient/digitalcard'
import VirtualCard from '@/components/patient/virtualcard'

export default function HealthCardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Health Card</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VirtualCard />
        <DigitalCard />
      </div>
    </div>
  )
}
