'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'

// Re-export the shared StatusBadge implementation to avoid duplication.
// This keeps the `components/patient` API stable while using the central implementation.
export { StatusBadge as PatientStatusBadge } from '@/components/shared/StatusBadge'

