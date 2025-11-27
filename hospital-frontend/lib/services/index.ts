// hospital-frontend/lib/services/index.ts
export { authService, type AuthUser, type LoginCredentials, type RegisterData } from './auth-service';
export { patientService, type PatientProfile, type AssetDeposit } from './patient-service';
export { hospitalService, type HospitalInfo, type AssetRequest, type TradeRecord } from './hospital-service';
export { bankService, type BankStaff, type MintingRequest, type TokenLedger } from './bank-service';
