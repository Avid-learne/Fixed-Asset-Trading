// Insurance Company NOC API Usage Examples

// ============================================================================
// 1. CHECK DOCUMENT STATUS
// ============================================================================

// TypeScript/JavaScript Example
async function checkDocumentStatus(fractionalizationRequestId: string, patientId: string, hospitalId: string) {
  const response = await fetch(
    `http://localhost:8000/api/insurance/documents/status?fractionalizationRequestId=${fractionalizationRequestId}&patientId=${patientId}&hospitalId=${hospitalId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Document Status:', {
      allComplete: data.data.allDocumentsComplete,
      required: data.data.totalRequiredDocuments,
      verified: data.data.verifiedDocuments,
      submitted: data.data.submittedDocuments,
      documents: data.data.documents
    });
    
    if (data.data.allDocumentsComplete) {
      console.log('✅ All documents are complete and verified. Ready to issue NOC!');
    } else {
      console.log(`⏳ Pending: ${data.data.totalRequiredDocuments - data.data.verifiedDocuments} documents need verification`);
    }
  }
  
  return data.data;
}

// ============================================================================
// 2. ISSUE NOC CERTIFICATE
// ============================================================================

async function issueNocCertificate(
  fractionalizationRequestId: string,
  patientId: string,
  hospitalId: string,
  validityDays: number = 365,
  remarks?: string
) {
  const response = await fetch(
    'http://localhost:8000/api/insurance/noc/issue',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fractionalizationRequestId,
        patientId,
        hospitalId,
        validityDays,
        remarks: remarks || 'Certificate issued for health token fractionalization'
      })
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ NOC Certificate Issued Successfully!');
    console.log('NOC Details:', {
      nocNumber: data.data.nocNumber,
      nocId: data.data.nocId,
      status: data.data.status,
      issuedAt: data.data.issuedAt,
      expiresAt: data.data.expiresAt,
      documentUrl: data.data.documentUrl
    });
  } else {
    console.error('❌ Failed to issue NOC:', data.message);
  }
  
  return data.data;
}

// ============================================================================
// 3. GET NOC CERTIFICATE
// ============================================================================

async function getNocCertificate(fractionalizationRequestId: string) {
  const response = await fetch(
    `http://localhost:8000/api/insurance/noc/${fractionalizationRequestId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log('NOC Certificate Retrieved:', data.data);
  } else {
    console.error('Certificate not found:', data.message);
  }
  
  return data.data;
}

// ============================================================================
// 4. GET PATIENT'S NOC CERTIFICATES
// ============================================================================

async function getPatientNocCertificates(patientId: string) {
  const response = await fetch(
    `http://localhost:8000/api/insurance/patient/${patientId}/noc-certificates`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (data.success && data.data.length > 0) {
    console.log(`Found ${data.data.length} NOC certificates for patient:`);
    data.data.forEach((noc: any) => {
      console.log(`  - ${noc.nocNumber} (Status: ${noc.status})`);
    });
  }
  
  return data.data || [];
}

// ============================================================================
// 5. VERIFY DOCUMENT
// ============================================================================

async function verifyDocument(documentId: string, verificationNotes?: string) {
  const response = await fetch(
    `http://localhost:8000/api/insurance/documents/${documentId}/verify`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verificationNotes: verificationNotes || 'Document verified and acceptable'
      })
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log(`✅ Document verified: ${data.data.documentType}`);
  }
  
  return data.data;
}

// ============================================================================
// 6. REJECT DOCUMENT
// ============================================================================

async function rejectDocument(documentId: string, rejectionReason: string) {
  const response = await fetch(
    `http://localhost:8000/api/insurance/documents/${documentId}/reject`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rejectionReason
      })
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log(`❌ Document rejected: ${data.data.documentType}`);
    console.log(`Reason: ${rejectionReason}`);
  }
  
  return data.data;
}

// ============================================================================
// 7. GET DOCUMENT REQUIREMENTS
// ============================================================================

async function getDocumentRequirements() {
  const response = await fetch(
    'http://localhost:8000/api/insurance/document-requirements',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Mandatory Document Requirements:');
    data.data.forEach((doc: any) => {
      console.log(`  • ${doc.documentType}`);
      console.log(`    ${doc.description}`);
    });
  }
  
  return data.data || [];
}

// ============================================================================
// 8. REVOKE NOC CERTIFICATE
// ============================================================================

async function revokeNocCertificate(nocId: string, reason: string) {
  const response = await fetch(
    `http://localhost:8000/api/insurance/noc/${nocId}/revoke`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason
      })
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log(`🛑 NOC Certificate Revoked: ${data.data.nocNumber}`);
    console.log(`Reason: ${reason}`);
  }
  
  return data.data;
}

// ============================================================================
// COMPLETE WORKFLOW EXAMPLE
// ============================================================================

async function completeNocWorkflow() {
  const fractionalizationRequestId = 'uuid-xxx';
  const patientId = 'uuid-yyy';
  const hospitalId = 'uuid-zzz';
  
  console.log('🚀 Starting NOC Issuance Workflow...\n');
  
  // Step 1: Check document status
  console.log('Step 1️⃣ : Checking document status...');
  const docStatus = await checkDocumentStatus(
    fractionalizationRequestId,
    patientId,
    hospitalId
  );
  
  if (!docStatus.allDocumentsComplete) {
    console.log(`⚠️  Missing ${docStatus.totalRequiredDocuments - docStatus.verifiedDocuments} documents`);
    
    // Review and verify pending documents
    console.log('\nStep 2️⃣ : Verifying pending documents...');
    for (const doc of docStatus.documents) {
      if (doc.status === 'PENDING_REVIEW') {
        console.log(`Verifying: ${doc.documentType}`);
        await verifyDocument(doc.documentId, 'Document verification passed');
      }
    }
    
    // Re-check status
    console.log('\nStep 3️⃣ : Re-checking document status...');
    const updatedStatus = await checkDocumentStatus(
      fractionalizationRequestId,
      patientId,
      hospitalId
    );
    
    if (!updatedStatus.allDocumentsComplete) {
      console.error('❌ Not all documents verified. Cannot proceed.');
      return;
    }
  }
  
  // Step 4: Issue NOC certificate
  console.log('\nStep 4️⃣ : Issuing NOC Certificate...');
  const noc = await issueNocCertificate(
    fractionalizationRequestId,
    patientId,
    hospitalId,
    365,
    'NOC issued for health token fractionalization'
  );
  
  if (noc) {
    console.log('\n✅ Workflow Completed Successfully!');
    console.log(`NOC Certificate: ${noc.nocNumber}`);
    console.log(`Download: ${noc.documentUrl}`);
  }
}

// ============================================================================
// SERVICE CLASS WRAPPER (for React/Vue)
// ============================================================================

class InsuranceNocService {
  private apiUrl = 'http://localhost:8000/api/insurance';
  private authToken: string;
  
  constructor(authToken: string) {
    this.authToken = authToken;
  }
  
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    return await response.json();
  }
  
  async checkDocumentStatus(fractionalizationRequestId: string, patientId: string, hospitalId: string) {
    return this.request(`/documents/status?fractionalizationRequestId=${fractionalizationRequestId}&patientId=${patientId}&hospitalId=${hospitalId}`);
  }
  
  async issueNoc(request: IssueNocRequest) {
    return this.request('/noc/issue', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
  
  async getNoc(fractionalizationRequestId: string) {
    return this.request(`/noc/${fractionalizationRequestId}`);
  }
  
  async getPatientNocs(patientId: string) {
    return this.request(`/patient/${patientId}/noc-certificates`);
  }
  
  async verifyDocument(documentId: string, notes?: string) {
    return this.request(`/documents/${documentId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verificationNotes: notes || '' })
    });
  }
  
  async rejectDocument(documentId: string, reason: string) {
    return this.request(`/documents/${documentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason: reason })
    });
  }
  
  async getDocumentRequirements() {
    return this.request('/document-requirements');
  }
  
  async revokeNoc(nocId: string, reason: string) {
    return this.request(`/noc/${nocId}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
}

// Usage in React/Vue
// const insuranceService = new InsuranceNocService(authToken);
// const docStatus = await insuranceService.checkDocumentStatus(id1, id2, id3);
// const noc = await insuranceService.issueNoc({...});

interface IssueNocRequest {
  fractionalizationRequestId: string;
  patientId: string;
  hospitalId: string;
  validityDays?: number;
  remarks?: string;
}
