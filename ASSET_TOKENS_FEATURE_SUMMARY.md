# Patient Asset Tokens Feature - Implementation Summary

## Overview
Patients can now view all their linked asset tokens with their real-time availability status (available vs locked in trades).

## Backend Changes

### 1. New DTO
**File:** `SehatVaultBackend/src/main/java/.../marketplace/dto/PatientAssetTokenDto.java`
- Combines AssetDeposit and PatientAtAssignment information
- Fields include:
  - Asset details (type, value, weight, status)
  - AT allocation (totalAtAssigned, availableAt, unavailableAt)
  - Availability status
  - Monetary values in PKR

### 2. Service Enhancement
**File:** `AtTradingService.java`
- Added `getPatientAssetTokens(UUID patientId)` method
- Fetches all PatientAtAssignments for the patient
- Joins with AssetDeposit data to show original asset info
- Calculates monetary values (1 AT = 10 PKR)

### 3. Repository Update
**File:** `AssetDepositRepository.java`
- Added `findByPatientId(UUID patientId)` method

### 4. New API Endpoint
**File:** `AtTradingController.java`
- Endpoint: `GET /api/marketplace/at-trading/patient/{patientId}/asset-tokens`
- Returns list of PatientAssetTokenDto
- Shows all patient's linked asset tokens with availability data

## Frontend Changes

### 1. Frontend Service
**File:** `hospitalfrontend/services/marketplaceService.ts`
- Added `PatientAssetToken` interface
- Added `getPatientAssetTokens(patientId)` method

### 2. Patient Dashboard Page
**File:** `hospitalfrontend/app/patient/linked-assets/page.tsx`
- **Summary Cards:**
  - Total AT Tokens assigned
  - Available AT (ready to trade)
  - In Trade AT (locked in trades)
  - Monetary value in PKR
  
- **Detailed Token View for Each Asset:**
  - Token Assignment details (total, available, unavailable)
  - Availability status badge (AVAILABLE/IN TRADE)
  - Monetary values breakdown
  - Asset details (weight, dates)
  - Timeline of submission/approval/assignment
  - Alert when AT is locked in active trades

## Key Features

1. **Real-time Availability Tracking:**
   - Shows exactly how many AT are available vs locked
   - Status clearly displayed with color-coded badges
   - Alert messages when tokens are in active trades

2. **Comprehensive Asset Information:**
   - Links back to original asset deposit
   - Shows asset type, value, and weight
   - Displays approval timeline

3. **Monetary Value Clarity:**
   - Conversion: 1 AT = 10 PKR
   - Shows values in PKR for better understanding
   - Separates available vs locked amounts

4. **Easy Testing:**
   - View all assets and their token status in one place
   - Test backend logic by observing:
     - How availableAt/unavailableAt change when trades start
     - How status changes from AVAILABLE to UNAVAILABLE
     - How AT returns to available after trade settlement

## Testing the Backend Logic

### Scenario 1: Fresh Asset Deposit
- Patient deposits asset
- View asset token page
- Should see: totalAtAssigned = expected AT, availableAt = full amount, status = AVAILABLE

### Scenario 2: Asset in Active Trade
- Patient starts a trade with their AT
- View asset token page
- Should see: unavailableAt increases, availableAt decreases, status = UNAVAILABLE

### Scenario 3: Trade Settlement
- Trade ends and AT is returned
- View asset token page
- Should see: unavailableAt = 0, availableAt = full amount again, status = AVAILABLE

## API Response Example
```json
[
  {
    "assetId": "uuid",
    "assignmentId": "uuid",
    "totalAtAssigned": 10,
    "availableAt": 7,
    "unavailableAt": 3,
    "availabilityStatus": "UNAVAILABLE",
    "monetaryValuePkr": 100,
    "availableMonetaryValuePkr": 70,
    "unavailableMonetaryValuePkr": 30,
    "assetType": "GOLD",
    "assetValue": 50000,
    "depositStatus": "MINTED",
    "assignedAt": "2026-03-30T12:00:00"
  }
]
```

## Components Involved

**Backend:**
- PatientAtAssignmentRepository (existing)
- AssetDepositRepository (updated)
- AtTradingService (updated)
- AtTradingController (updated)
- PatientAssetTokenDto (new)

**Frontend:**
- marketplaceService (updated)
- linked-assets page (updated)
