'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function QRCodeCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital Health Card</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-40 bg-muted rounded">
          <span className="text-muted-foreground text-sm">QR Code Placeholder</span>
        </div>
      </CardContent>
    </Card>
  )
}
