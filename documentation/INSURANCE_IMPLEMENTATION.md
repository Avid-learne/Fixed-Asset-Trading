# Insurance Company NOC API Implementation Guide

## Overview
This implementation provides a complete REST API for insurance companies to issue NOC (No Objection Certificate) certificates for fractionalization requests after validating that all required documents are complete.

## Files Created

### Entities
- **InsuranceCompany.java** - Represents insurance company information
- **NocCertificate.java** - Represents issued NOC certificates
- **DocumentRequirement.java** - Defines mandatory document types required for NOC
- **SubmittedDocument.java** - Tracks submitted documents and their verification status

### DTOs (Data Transfer Objects)
- **InsuranceCompanyDto.java** - Insurance company response DTO
- **NocCertificateDto.java** - NOC certificate response DTO
- **DocumentStatusDto.java** - Individual document status information
- **DocumentStatusResponseDto.java** - Complete document verification status
- **CheckDocumentStatusRequest.java** - Request DTO for checking document status
- **IssueNocCertificateRequest.java** - Request DTO for issuing NOC

### Repositories
- **InsuranceCompanyRepository.java** - Database access for insurance companies
- **NocCertificateRepository.java** - Database access for NOC certificates
- **DocumentRequirementRepository.java** - Database access for document requirements
- **SubmittedDocumentRepository.java** - Database access for submitted documents

### Services
- **InsuranceService.java** - Business logic for NOC issuance and document verification
- **DocumentRequirementInitializer.java** - Initializes default document requirements on startup

### Controller
- **InsuranceController.java** - REST API endpoints for insurance operations

## Key Features

### 1. Document Validation
- Tracks document submission status (PENDING_REVIEW, VERIFIED, REJECTED, SUBMITTED)
- Verifies all mandatory documents before NOC issuance
- Allows insurance companies to verify or reject documents with notes

### 2. NOC Issuance
- Generates unique NOC numbers in format: `NOC-YYYYMMDD-{INSURER_CODE}-{RANDOM}`
- Configurable validity period (default 365 days)
- Stores NOC certificate details with document URLs

### 3. Document Requirements
- Pre-configured with 8 mandatory document types
- Auto-initialized on application startup
- Can be extended or modified as needed

### 4. NOC Certificate Management
- Track certificate status (ISSUED, EXPIRED, REVOKED, PENDING)
- Revoke certificates with reason tracking
- Query certificates by patient or request ID

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/insurance/documents/status` | Check document completion status |
| POST | `/api/insurance/noc/issue` | Issue NOC certificate |
| GET | `/api/insurance/noc/{id}` | Get NOC certificate details |
| GET | `/api/insurance/patient/{id}/noc-certificates` | Get patient's NOC certificates |
| POST | `/api/insurance/documents/{id}/verify` | Verify a document |
| POST | `/api/insurance/documents/{id}/reject` | Reject a document |
| GET | `/api/insurance/document-requirements` | Get mandatory document types |
| POST | `/api/insurance/noc/{id}/revoke` | Revoke NOC certificate |

## Default Mandatory Documents

1. Identity Verification - Government-issued ID
2. Address Proof - Utility bill or bank statement
3. Asset Ownership Certificate - Proof of asset ownership
4. Bank Statement - Latest 3 months statements
5. Medical Certificate - Health check-up report
6. Employment Verification - Employment letter/income statement
7. Tax Return Copy - Last year's tax return (optional)
8. Asset Appraisal Report - Professional asset valuation

## Database Schema

### insurance_companies
```sql
- insurance_company_id (UUID, PK)
- company_name (VARCHAR, UNIQUE)
- registration_number (VARCHAR, UNIQUE)
- contact_email (VARCHAR)
- contact_phone (VARCHAR)
- address (TEXT)
- regulatory_license (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### document_requirements
```sql
- requirement_id (UUID, PK)
- document_type (VARCHAR, UNIQUE)
- description (TEXT)
- is_mandatory (BOOLEAN)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

### submitted_documents
```sql
- document_id (UUID, PK)
- fractionalization_request_id (UUID, FK)
- requirement_id (UUID, FK)
- document_type (VARCHAR)
- document_url (TEXT)
- status (ENUM: SUBMITTED, VERIFIED, REJECTED, PENDING_REVIEW)
- verification_notes (TEXT)
- submitted_at, verified_at (TIMESTAMP)
```

### noc_certificates
```sql
- noc_id (UUID, PK)
- noc_number (VARCHAR, UNIQUE)
- fractionalization_request_id (UUID)
- insurance_company_id (UUID, FK)
- hospital_id (UUID)
- patient_id (UUID)
- status (ENUM: ISSUED, EXPIRED, REVOKED, PENDING)
- issued_at, expires_at (TIMESTAMP)
- document_url (TEXT)
- remarks (TEXT)
- created_at, updated_at (TIMESTAMP)
```

## Integration Steps

### 1. Database Setup
Execute the SQL schema file:
```bash
psql -U postgres -d sehatvault < INSURANCE_SCHEMA.sql
```

Or create the tables using JPA/Hibernate with proper configuration.

### 2. Verify Service Initialization
On application startup, the `DocumentRequirementInitializer` will automatically create default document requirements.

### 3. Testing the API

**Step 1: Check if documents are complete**
```bash
curl -X GET "http://localhost:8000/api/insurance/documents/status?fractionalizationRequestId={id}&patientId={id}&hospitalId={id}" \
  -H "Authorization: Bearer {token}"
```

**Step 2: Issue NOC certificate (if all documents are verified)**
```bash
curl -X POST "http://localhost:8000/api/insurance/noc/issue" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "fractionalizationRequestId": "{id}",
    "patientId": "{id}",
    "hospitalId": "{id}",
    "validityDays": 365,
    "remarks": "Certificate issued"
  }'
```

**Step 3: Get NOC certificate**
```bash
curl -X GET "http://localhost:8000/api/insurance/noc/{fractionalizationRequestId}" \
  -H "Authorization: Bearer {token}"
```

## Configuration

### Default Insurance Company ID
Currently hardcoded to: `00000000-0000-0000-0000-000000000001`

In production, this should be:
- Retrieved from the authenticated user's profile
- Retrieved from the request header
- Configured in environment variables

### Document Requirements
Auto-initialized with 8 mandatory document types. To add more:
1. Modify the `DocumentRequirementInitializer` class
2. Or insert directly into the database after schema creation

### NOC Validity Period
- Default: 365 days
- Can be customized per request via `validityDays` parameter

## Error Handling

The API provides comprehensive error messages:

```json
{
  "success": false,
  "message": "Cannot issue NOC: Not all mandatory documents are verified. Verified: 7, Required: 8",
  "data": null
}
```

Common error scenarios:
- Missing authentication: Returns 401 Unauthorized
- Not all documents verified: Returns 400 Bad Request
- NOC already exists: Returns 400 Bad Request
- Invalid parameters: Returns 400 Bad Request
- Database errors: Returns 500 Internal Server Error

## Future Enhancements

1. **PDF Generation** - Generate actual PDF documents for NOC certificates
2. **Email Notifications** - Send NOC certificates to patients/hospitals via email
3. **Digital Signatures** - Add cryptographic signatures to NOC documents
4. **Audit Logging** - Log all NOC issuance and verification events
5. **Insurance Company Portal** - Create UI for insurance companies to manage documents
6. **Automated Document Verification** - ML-based document verification
7. **Webhook Support** - Notify external systems when NOC is issued
8. **Bulk Operations** - Process multiple NOC requests in batch

## Security Considerations

1. **Authentication & Authorization**
   - Ensure proper role-based access control (RBAC) is implemented
   - Only insurance company staff should have access to issue NOCs
   - Hospitals and patients should only view their own certificates

2. **Data Protection**
   - Encrypt sensitive document URLs
   - Use HTTPS for all API communication
   - Implement rate limiting to prevent abuse

3. **Audit Trail**
   - Log all document verifications
   - Track NOC issuance history
   - Maintain revision history for documents

4. **Compliance**
   - Ensure GDPR compliance for personal data
   - Follow insurance regulatory requirements
   - Maintain document retention policies

## Support

For issues or questions about the Insurance NOC API implementation, refer to:
- `INSURANCE_NOC_API.md` - Complete API documentation
- `INSURANCE_SCHEMA.sql` - Database schema
- Code comments in service and controller classes
