# Insurance Company NOC Certificate API

## Overview
This API allows insurance companies to issue NOC (No Objection Certificate) certificates for fractionalization requests after validating that all required documents are complete.

## Base URL
```
http://localhost:8000/api/insurance
```

## Authentication
All endpoints require Bearer token authentication in the Authorization header.

## Endpoints

### 1. Check Document Status
**Endpoint:** `GET /api/insurance/documents/status`

**Description:** Check if all required documents are submitted and verified for a fractionalization request.

**Query Parameters:**
- `fractionalizationRequestId` (UUID, required) - The fractionalization request ID
- `patientId` (UUID, required) - The patient ID
- `hospitalId` (UUID, required) - The hospital ID

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "allDocumentsComplete": true,
    "totalRequiredDocuments": 8,
    "submittedDocuments": 8,
    "verifiedDocuments": 8,
    "rejectedDocuments": 0,
    "documents": [
      {
        "documentId": "uuid",
        "documentType": "Identity Verification",
        "status": "VERIFIED",
        "documentUrl": "https://...",
        "verificationNotes": "Valid CNIC",
        "submittedAt": "2024-01-15T10:30:00",
        "verifiedAt": "2024-01-15T11:00:00"
      }
    ]
  }
}
```

---

### 2. Issue NOC Certificate
**Endpoint:** `POST /api/insurance/noc/issue`

**Description:** Issue an NOC certificate if all documents are verified. This generates and returns the NOC certificate details.

**Request Body:**
```json
{
  "fractionalizationRequestId": "uuid",
  "patientId": "uuid",
  "hospitalId": "uuid",
  "validityDays": 365,
  "remarks": "Certificate issued for health token fractionalization"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "nocId": "uuid",
    "nocNumber": "NOC-20240115-AB12-XY8Z9QW",
    "fractionalizationRequestId": "uuid",
    "status": "ISSUED",
    "issuedAt": "2024-01-15T11:30:00",
    "expiresAt": "2025-01-15T11:30:00",
    "documentUrl": "https://sehatvault.com/noc/NOC-20240115-AB12-XY8Z9QW.pdf",
    "remarks": "Certificate issued for health token fractionalization",
    "createdAt": "2024-01-15T11:30:00"
  }
}
```

**Error Cases:**
- `400 Bad Request` - If not all documents are verified
- `400 Bad Request` - If NOC already exists for this request
- `401 Unauthorized` - If authentication fails

---

### 3. Get NOC Certificate
**Endpoint:** `GET /api/insurance/noc/{fractionalizationRequestId}`

**Description:** Retrieve NOC certificate details for a specific fractionalization request.

**Path Parameters:**
- `fractionalizationRequestId` (UUID) - The fractionalization request ID

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "nocId": "uuid",
    "nocNumber": "NOC-20240115-AB12-XY8Z9QW",
    "fractionalizationRequestId": "uuid",
    "status": "ISSUED",
    "issuedAt": "2024-01-15T11:30:00",
    "expiresAt": "2025-01-15T11:30:00",
    "documentUrl": "https://sehatvault.com/noc/NOC-20240115-AB12-XY8Z9QW.pdf",
    "remarks": "Certificate issued for health token fractionalization",
    "createdAt": "2024-01-15T11:30:00"
  }
}
```

---

### 4. Get Patient's NOC Certificates
**Endpoint:** `GET /api/insurance/patient/{patientId}/noc-certificates`

**Description:** Retrieve all NOC certificates issued to a specific patient.

**Path Parameters:**
- `patientId` (UUID) - The patient ID

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "nocId": "uuid",
      "nocNumber": "NOC-20240115-AB12-XY8Z9QW",
      "fractionalizationRequestId": "uuid",
      "status": "ISSUED",
      "issuedAt": "2024-01-15T11:30:00",
      "expiresAt": "2025-01-15T11:30:00",
      "documentUrl": "https://sehatvault.com/noc/NOC-20240115-AB12-XY8Z9QW.pdf",
      "remarks": "Certificate issued for health token fractionalization",
      "createdAt": "2024-01-15T11:30:00"
    }
  ]
}
```

---

### 5. Verify Document
**Endpoint:** `POST /api/insurance/documents/{documentId}/verify`

**Description:** Verify a submitted document as complete and acceptable.

**Path Parameters:**
- `documentId` (UUID) - The document ID

**Request Body:**
```json
{
  "verificationNotes": "Document verified and acceptable"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "documentId": "uuid",
    "documentType": "Identity Verification",
    "status": "VERIFIED",
    "documentUrl": "https://...",
    "verificationNotes": "Document verified and acceptable",
    "submittedAt": "2024-01-15T10:30:00",
    "verifiedAt": "2024-01-15T11:00:00"
  }
}
```

---

### 6. Reject Document
**Endpoint:** `POST /api/insurance/documents/{documentId}/reject`

**Description:** Reject a submitted document with a reason.

**Path Parameters:**
- `documentId` (UUID) - The document ID

**Request Body:**
```json
{
  "rejectionReason": "Document is blurry and unclear"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "documentId": "uuid",
    "documentType": "Identity Verification",
    "status": "REJECTED",
    "documentUrl": "https://...",
    "verificationNotes": "Document is blurry and unclear",
    "submittedAt": "2024-01-15T10:30:00",
    "verifiedAt": "2024-01-15T11:00:00"
  }
}
```

---

### 7. Get Document Requirements
**Endpoint:** `GET /api/insurance/document-requirements`

**Description:** Get the list of mandatory documents required for NOC issuance.

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "requirementId": "uuid",
      "documentType": "Identity Verification",
      "description": "Valid government-issued ID (CNIC, Passport, or Driving License)",
      "isMandatory": true,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00"
    },
    {
      "requirementId": "uuid",
      "documentType": "Address Proof",
      "description": "Recent utility bill or bank statement showing current address",
      "isMandatory": true,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00"
    }
  ]
}
```

---

### 8. Revoke NOC Certificate
**Endpoint:** `POST /api/insurance/noc/{nocId}/revoke`

**Description:** Revoke a previously issued NOC certificate.

**Path Parameters:**
- `nocId` (UUID) - The NOC certificate ID

**Request Body:**
```json
{
  "reason": "Certificate revoked due to fraud detection"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "nocId": "uuid",
    "nocNumber": "NOC-20240115-AB12-XY8Z9QW",
    "fractionalizationRequestId": "uuid",
    "status": "REVOKED",
    "issuedAt": "2024-01-15T11:30:00",
    "expiresAt": "2025-01-15T11:30:00",
    "documentUrl": "https://sehatvault.com/noc/NOC-20240115-AB12-XY8Z9QW.pdf",
    "remarks": "Certificate issued for health token fractionalization; REVOKED: Certificate revoked due to fraud detection",
    "createdAt": "2024-01-15T11:30:00"
  }
}
```

---

## Default Mandatory Documents

The system comes pre-configured with the following mandatory documents:

1. **Identity Verification** - Valid government-issued ID (CNIC, Passport, or Driving License)
2. **Address Proof** - Recent utility bill or bank statement showing current address
3. **Asset Ownership Certificate** - Original certificate or deed proving ownership of the asset
4. **Bank Statement** - Latest 3 months bank statements for financial verification
5. **Medical Certificate** - Health check-up report from recognized hospital/clinic
6. **Employment Verification** - Employment letter or income statement from employer
7. **Asset Appraisal Report** - Professional asset valuation report

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Common HTTP Status Codes:
- `200 OK` - Successful request
- `400 Bad Request` - Invalid request or business logic error
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## NOC Number Format

NOC numbers are generated in the format: `NOC-{YYYYMMDD}-{INSURER_CODE}-{RANDOM}`

Example: `NOC-20240115-AB12-XY8Z9QW`

- **YYYYMMDD** - Date of issuance (20240115)
- **INSURER_CODE** - Insurance company identifier (first 4 characters of company ID)
- **RANDOM** - Random 8-character code for uniqueness

## Validity Period

By default, NOC certificates are valid for 365 days from the issue date. The validity period can be customized by providing `validityDays` in the issue request.

## Document Status States

- **PENDING_REVIEW** - Document submitted, awaiting verification
- **VERIFIED** - Document verified and accepted
- **REJECTED** - Document rejected and needs resubmission
- **SUBMITTED** - Document received

## Certificate Status States

- **PENDING** - Certificate generation in progress
- **ISSUED** - Certificate successfully issued
- **EXPIRED** - Certificate has expired
- **REVOKED** - Certificate has been revoked
