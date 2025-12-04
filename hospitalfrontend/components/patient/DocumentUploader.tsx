'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

export function DocumentUploader() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Upload ownership proofs, photos, and receipts.</p>
      <div className="border rounded-md p-6 text-center">
        <p className="text-muted-foreground mb-3">Drag & drop files here or click to browse</p>
        <Button variant="outline">Browse Files</Button>
      </div>
    </div>
  )
}
