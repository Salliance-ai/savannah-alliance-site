// Core Types and Interfaces for Botlace Platform

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  tier: 'starter' | 'practice' | 'enterprise';
  providerLimit: number;
  createdAt: Date;
  updatedAt: Date;
  settings: TenantSettings;
}

export interface TenantSettings {
  features: {
    clinicalOps: boolean;
    careNav: boolean;
    patient360: boolean;
    marketOps: boolean;
    revenueOps: boolean;
    enterpriseIntelligence: boolean;
  };
  integrations: {
    epic: boolean;
    icanotes: boolean;
    tebra: boolean;
    ghl: boolean;
    stripe: boolean;
    quickbooks: boolean;
  };
}

export interface Provider {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  specialty: string;
  npi?: string;
  licenseNumber?: string;
  email: string;
  active: boolean;
  createdAt: Date;
}

export interface Patient {
  id: string;
  tenantId: string;
  fhirId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'unknown';
  mrn?: string;
  email?: string;
  phone?: string;
  address?: Address;
  insurance?: InsuranceInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface InsuranceInfo {
  payer: string;
  policyNumber: string;
  groupNumber?: string;
  effectiveDate: Date;
  expirationDate?: Date;
}

export interface ClinicalNote {
  id: string;
  tenantId: string;
  providerId: string;
  patientId: string;
  encounterDate: Date;
  noteType: 'progress' | 'assessment' | 'treatment_plan' | 'summary';
  content: string;
  aiGenerated: boolean;
  icdCodes: ICDCode[];
  cptCodes?: string[];
  status: 'draft' | 'review' | 'signed' | 'finalized';
  createdAt: Date;
  updatedAt: Date;
}

export interface ICDCode {
  code: string;
  description: string;
  version: string; // e.g., "ICD-10-CM"
  confidence?: number;
}

export interface Appointment {
  id: string;
  tenantId: string;
  providerId: string;
  patientId: string;
  startTime: Date;
  endTime: Date;
  type: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason?: string;
  notes?: string;
  aiSuggested?: boolean;
  createdAt: Date;
}

export interface Patient360Profile {
  patientId: string;
  tenantId: string;
  clinical: {
    diagnoses: ICDCode[];
    medications: Medication[];
    allergies: Allergy[];
    vitalSigns: VitalSign[];
    lastVisit?: Date;
  };
  engagement: {
    appointmentAdherence: number; // percentage
    communicationResponsiveness: number;
    portalUsage?: number;
    satisfactionScore?: number;
  };
  behavioral: {
    riskScore: number;
    predictedChurn: number;
    nextAppointmentLikelihood: number;
    preferredContactMethod: 'email' | 'phone' | 'sms' | 'portal';
  };
  updatedAt: Date;
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: Date;
  endDate?: Date;
  prescriber?: string;
}

export interface Allergy {
  substance: string;
  reaction?: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface VitalSign {
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'height' | 'bmi';
  value: number;
  unit: string;
  recordedAt: Date;
}

export interface MarketOpsLead {
  id: string;
  tenantId: string;
  source: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  score: number; // AI-calculated lead score
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  campaignId?: string;
  ghlContactId?: string;
  predictedValue: number;
  churnRisk?: number;
  convertedAt?: Date;
  createdAt: Date;
}

export interface RevenueMetrics {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  collections: number;
  outstandingAr: number;
  denialRate: number;
  averageDaysToPayment: number;
  anomalies: RevenueAnomaly[];
  forecasts: RevenueForecast[];
}

export interface RevenueAnomaly {
  type: 'unusual_drop' | 'unusual_spike' | 'denial_increase' | 'collection_delay';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  affectedAmount?: number;
  recommendation?: string;
}

export interface RevenueForecast {
  period: Date;
  predictedRevenue: number;
  confidence: number;
  factors: string[];
}

export interface EnterpriseKPI {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  providerLoad: {
    averageAppointmentsPerDay: number;
    utilizationRate: number;
  };
  patientEngagement: {
    averageSatisfaction: number;
    retentionRate: number;
    portalAdoption: number;
  };
  revenueEfficiency: {
    revenuePerProvider: number;
    collectionRate: number;
    daysInAr: number;
  };
  clinicalMetrics: {
    documentationCompletionRate: number;
    averageCodingAccuracy: number;
    treatmentPlanAdherence: number;
  };
}

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
  [key: string]: any;
}

export interface ACREReasoningRequest {
  context: {
    patientId: string;
    encounterId?: string;
    clinicalData?: any;
    history?: any[];
  };
  task: 'documentation' | 'coding' | 'treatment_planning' | 'risk_assessment';
  specialty?: string;
  requirements?: {
    evidenceBased?: boolean;
    complianceCheck?: boolean;
  };
}

export interface ACREReasoningResponse {
  reasoning: string;
  recommendations: string[];
  confidence: number;
  evidence: EvidenceSource[];
  complianceFlags?: ComplianceFlag[];
  output?: any; // Task-specific output
}

export interface EvidenceSource {
  type: 'guideline' | 'study' | 'protocol' | 'standard';
  title: string;
  source: string;
  relevance: number;
}

export interface ComplianceFlag {
  type: 'hipaa' | 'clinical' | 'billing' | 'documentation';
  severity: 'info' | 'warning' | 'error';
  description: string;
  recommendation: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  compliance: {
    hipaaCompliant: boolean;
    phiAccessed: boolean;
    anonymized: boolean;
  };
}
