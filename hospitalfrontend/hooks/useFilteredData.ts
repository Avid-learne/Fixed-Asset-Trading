"use client"

import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'

/**
 * Hook to filter data based on user's role and affiliations
 * Implements minimum access principle
 */
export function useFilteredData<T extends Record<string, any>>(
  data: T[],
  options: {
    hospitalIdField?: keyof T
    bankIdField?: keyof T
    patientIdField?: keyof T
    userIdField?: keyof T
  } = {}
) {
  const { user } = useAuth()

  const filteredData = useMemo(() => {
    if (!user || !data) return []

    // Super admin sees everything
    if (user.role === UserRole.SUPER_ADMIN) {
      return data
    }

    // Filter based on role and affiliations
    return data.filter((item) => {
      // Hospital Admin/Staff: Filter by hospital affiliation
      if ((user.role === UserRole.HOSPITAL_ADMIN || user.role === UserRole.HOSPITAL_STAFF) && user.hospitalId) {
        if (options.hospitalIdField && item[options.hospitalIdField] !== user.hospitalId) {
          return false
        }
      }

      // Bank Officer: Filter by bank affiliation
      if (user.role === UserRole.BANK_OFFICER && user.bankId) {
        if (options.bankIdField && item[options.bankIdField] !== user.bankId) {
          return false
        }
        // Also filter by connected hospitals
        if (options.hospitalIdField && user.bank) {
          const hospitalId = item[options.hospitalIdField] as string
          if (!user.bank.connectedHospitalIds.includes(hospitalId)) {
            return false
          }
        }
      }

      // Patient: Only their own data
      if (user.role === UserRole.PATIENT) {
        if (options.userIdField && item[options.userIdField] !== user.id) {
          return false
        }
        if (options.patientIdField && item[options.patientIdField] !== user.id) {
          return false
        }
      }

      return true
    })
  }, [data, user, options])

  return filteredData
}

/**
 * Hook to get hospital-scoped data
 */
export function useHospitalData<T extends Record<string, any>>(
  data: T[],
  hospitalIdField: keyof T = 'hospitalId' as keyof T
) {
  return useFilteredData(data, { hospitalIdField })
}

/**
 * Hook to get bank-scoped data
 */
export function useBankData<T extends Record<string, any>>(
  data: T[],
  bankIdField: keyof T = 'bankId' as keyof T
) {
  return useFilteredData(data, { bankIdField })
}

/**
 * Hook to get patient-scoped data
 */
export function usePatientData<T extends Record<string, any>>(
  data: T[],
  patientIdField: keyof T = 'patientId' as keyof T
) {
  return useFilteredData(data, { patientIdField })
}

/**
 * Hook to sanitize patient data for bank officers
 * Removes personal/medical information
 */
export function useSanitizedPatientData<T extends Record<string, any>>(data: T[]) {
  const { user } = useAuth()

  const sanitizedData = useMemo(() => {
    if (!user || user.role !== UserRole.BANK_OFFICER) {
      return data
    }

    // Remove sensitive fields for bank officers
    const sensitiveFields = ['email', 'phone', 'address', 'medicalHistory', 'personalNotes', 'ssn', 'dateOfBirth']
    
    return data.map((item) => {
      const sanitized = { ...item }
      sensitiveFields.forEach((field) => {
        if (field in sanitized) {
          delete sanitized[field]
        }
      })
      // Replace name with anonymized version
      if ('name' in sanitized) {
        sanitized.name = `Patient-${sanitized.id?.toString().slice(0, 8)}`
      }
      return sanitized
    })
  }, [data, user])

  return sanitizedData
}
