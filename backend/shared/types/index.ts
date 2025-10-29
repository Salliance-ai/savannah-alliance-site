/**
 * Botlace Platform - Shared Type Definitions
 * Medical-grade types for FHIR, clinical data, and AI models
 */

// ==================== FHIR Types ====================

export type FHIRVersion = 'R4' | 'R5';

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: FHIRMeta;
  implicitRules?: string;
  language?: string;
}

export interface FHIRMeta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  security?: Coding[];
  tag?: Coding[];
}

export interface Coding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

// ==================== Patient Types ====================

export interface Patient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Address[];
  maritalStatus?: CodeableConcept;
  contact?: PatientContact[];
  communication?: PatientCommunication[];
}

export interface Identifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary';
  type?: CodeableConcept;
  system?: string;
  value?: string;
  period?: Period;
}

export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: Period;
}

export interface ContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: Period;
}

export interface Address {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: Period;
}

export interface Period {
  start?: string;
  end?: string;
}

export interface PatientContact {
  relationship?: CodeableConcept[];
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  organization?: Reference;
  period?: Period;
}

export interface PatientCommunication {
  language: CodeableConcept;
  preferred?: boolean;
}

export interface Reference {
  reference?: string;
  type?: string;
  identifier?: Identifier;
  display?: string;
}

// ==================== Clinical Types ====================

export interface Encounter extends FHIRResource {
  resourceType: 'Encounter';
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
  class: Coding;
  type?: CodeableConcept[];
  priority?: CodeableConcept;
  subject?: Reference;
  participant?: EncounterParticipant[];
  appointment?: Reference[];
  period?: Period;
  reasonCode?: CodeableConcept[];
  diagnosis?: EncounterDiagnosis[];
  hospitalization?: EncounterHospitalization;
  location?: EncounterLocation[];
}

export interface EncounterParticipant {
  type?: CodeableConcept[];
  period?: Period;
  individual?: Reference;
}

export interface EncounterDiagnosis {
  condition: Reference;
  use?: CodeableConcept;
  rank?: number;
}

export interface EncounterHospitalization {
  preAdmissionIdentifier?: Identifier;
  origin?: Reference;
  admitSource?: CodeableConcept;
  reAdmission?: CodeableConcept;
  dietPreference?: CodeableConcept[];
  specialCourtesy?: CodeableConcept[];
  specialArrangement?: CodeableConcept[];
  destination?: Reference;
  dischargeDisposition?: CodeableConcept;
}

export interface EncounterLocation {
  location: Reference;
  status?: 'planned' | 'active' | 'reserved' | 'completed';
  physicalType?: CodeableConcept;
  period?: Period;
}

export interface Observation extends FHIRResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled';
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference;
  encounter?: Reference;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  issued?: string;
  performer?: Reference[];
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  interpretation?: CodeableConcept[];
  note?: Annotation[];
  bodySite?: CodeableConcept;
  method?: CodeableConcept;
  referenceRange?: ObservationReferenceRange[];
  component?: ObservationComponent[];
}

export interface Quantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

export interface Annotation {
  authorReference?: Reference;
  authorString?: string;
  time?: string;
  text: string;
}

export interface ObservationReferenceRange {
  low?: Quantity;
  high?: Quantity;
  type?: CodeableConcept;
  appliesTo?: CodeableConcept[];
  age?: Range;
  text?: string;
}

export interface Range {
  low?: Quantity;
  high?: Quantity;
}

export interface ObservationComponent {
  code: CodeableConcept;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  dataAbsentReason?: CodeableConcept;
  interpretation?: CodeableConcept[];
  referenceRange?: ObservationReferenceRange[];
}

export interface Condition extends FHIRResource {
  resourceType: 'Condition';
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  category?: CodeableConcept[];
  severity?: CodeableConcept;
  code?: CodeableConcept;
  bodySite?: CodeableConcept[];
  subject: Reference;
  encounter?: Reference;
  onsetDateTime?: string;
  onsetAge?: Quantity;
  onsetPeriod?: Period;
  onsetRange?: Range;
  onsetString?: string;
  abatementDateTime?: string;
  abatementAge?: Quantity;
  abatementPeriod?: Period;
  abatementRange?: Range;
  abatementString?: string;
  recordedDate?: string;
  recorder?: Reference;
  asserter?: Reference;
  stage?: ConditionStage[];
  evidence?: ConditionEvidence[];
  note?: Annotation[];
}

export interface ConditionStage {
  summary?: CodeableConcept;
  assessment?: Reference[];
  type?: CodeableConcept;
}

export interface ConditionEvidence {
  code?: CodeableConcept[];
  detail?: Reference[];
}

export interface MedicationRequest extends FHIRResource {
  resourceType: 'MedicationRequest';
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  category?: CodeableConcept[];
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference;
  subject: Reference;
  encounter?: Reference;
  authoredOn?: string;
  requester?: Reference;
  performer?: Reference;
  recorder?: Reference;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  note?: Annotation[];
  dosageInstruction?: Dosage[];
  dispenseRequest?: MedicationRequestDispenseRequest;
  substitution?: MedicationRequestSubstitution;
}

export interface Dosage {
  sequence?: number;
  text?: string;
  additionalInstruction?: CodeableConcept[];
  patientInstruction?: string;
  timing?: Timing;
  asNeededBoolean?: boolean;
  asNeededCodeableConcept?: CodeableConcept;
  site?: CodeableConcept;
  route?: CodeableConcept;
  method?: CodeableConcept;
  doseAndRate?: DosageDoseAndRate[];
  maxDosePerPeriod?: Ratio;
  maxDosePerAdministration?: Quantity;
  maxDosePerLifetime?: Quantity;
}

export interface Timing {
  event?: string[];
  repeat?: TimingRepeat;
  code?: CodeableConcept;
}

export interface TimingRepeat {
  boundsDuration?: Duration;
  boundsRange?: Range;
  boundsPeriod?: Period;
  count?: number;
  countMax?: number;
  duration?: number;
  durationMax?: number;
  durationUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
  frequency?: number;
  frequencyMax?: number;
  period?: number;
  periodMax?: number;
  periodUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
  dayOfWeek?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  timeOfDay?: string[];
  when?: string[];
  offset?: number;
}

export interface Duration {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

export interface DosageDoseAndRate {
  type?: CodeableConcept;
  doseRange?: Range;
  doseQuantity?: Quantity;
  rateRatio?: Ratio;
  rateRange?: Range;
  rateQuantity?: Quantity;
}

export interface Ratio {
  numerator?: Quantity;
  denominator?: Quantity;
}

export interface MedicationRequestDispenseRequest {
  initialFill?: MedicationRequestDispenseRequestInitialFill;
  dispenseInterval?: Duration;
  validityPeriod?: Period;
  numberOfRepeatsAllowed?: number;
  quantity?: Quantity;
  expectedSupplyDuration?: Duration;
  performer?: Reference;
}

export interface MedicationRequestDispenseRequestInitialFill {
  quantity?: Quantity;
  duration?: Duration;
}

export interface MedicationRequestSubstitution {
  allowedBoolean?: boolean;
  allowedCodeableConcept?: CodeableConcept;
  reason?: CodeableConcept;
}

// ==================== Appointment Types ====================

export interface Appointment extends FHIRResource {
  resourceType: 'Appointment';
  status: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow' | 'entered-in-error' | 'checked-in' | 'waitlist';
  cancelationReason?: CodeableConcept;
  serviceCategory?: CodeableConcept[];
  serviceType?: CodeableConcept[];
  specialty?: CodeableConcept[];
  appointmentType?: CodeableConcept;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  priority?: number;
  description?: string;
  start?: string;
  end?: string;
  minutesDuration?: number;
  slot?: Reference[];
  created?: string;
  comment?: string;
  patientInstruction?: string;
  basedOn?: Reference[];
  participant: AppointmentParticipant[];
  requestedPeriod?: Period[];
}

export interface AppointmentParticipant {
  type?: CodeableConcept[];
  actor?: Reference;
  required?: 'required' | 'optional' | 'information-only';
  status: 'accepted' | 'declined' | 'tentative' | 'needs-action';
  period?: Period;
}

// ==================== AI/ML Types ====================

export interface ClinicalNote {
  noteId: string;
  patientId: string;
  providerId: string;
  encounterId?: string;
  encounter: {
    date: Date;
    type: string;
    chiefComplaint: string;
  };
  subjective: string;
  objective: {
    vitals?: VitalSigns;
    physicalExam?: string;
  };
  assessment: DiagnosisAssessment[];
  plan: TreatmentPlan;
  aiGenerated: boolean;
  aiConfidenceScore?: number;
  clinicianReview: 'pending' | 'approved' | 'modified' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VitalSigns {
  temperature?: { value: number; unit: 'F' | 'C' };
  bloodPressure?: { systolic: number; diastolic: number; unit: 'mmHg' };
  heartRate?: { value: number; unit: 'bpm' };
  respiratoryRate?: { value: number; unit: 'breaths/min' };
  oxygenSaturation?: { value: number; unit: '%' };
  weight?: { value: number; unit: 'kg' | 'lb' };
  height?: { value: number; unit: 'cm' | 'in' };
  bmi?: number;
}

export interface DiagnosisAssessment {
  code: string; // ICD-10 code
  description: string;
  type: 'primary' | 'secondary' | 'differential';
  confidence?: number; // AI confidence score (0-1)
  evidenceBased?: string[]; // References to supporting observations
}

export interface TreatmentPlan {
  medications?: MedicationPlan[];
  procedures?: ProcedurePlan[];
  followUp?: FollowUpPlan;
  patientEducation?: string[];
  lifestyle?: string[];
  referrals?: Referral[];
}

export interface MedicationPlan {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions?: string;
}

export interface ProcedurePlan {
  code: string; // CPT code
  description: string;
  scheduledDate?: Date;
  notes?: string;
}

export interface FollowUpPlan {
  timeframe: string;
  reason: string;
  appointmentType?: string;
}

export interface Referral {
  specialty: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergent';
  notes?: string;
}

// ==================== Patient 360 Types ====================

export interface Patient360Profile {
  patientId: string;
  demographics: PatientDemographics;
  clinical: ClinicalSummary;
  engagement: EngagementMetrics;
  financial: FinancialSummary;
  marketing: MarketingAttribution;
  riskScores: RiskScores;
  lastUpdated: Date;
}

export interface PatientDemographics {
  name: HumanName;
  dateOfBirth: Date;
  gender: string;
  contact: ContactPoint[];
  address: Address[];
  preferredLanguage?: string;
  maritalStatus?: string;
  insurance?: InsuranceInfo[];
}

export interface InsuranceInfo {
  insuranceId: string;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  planName: string;
  coverageType: 'primary' | 'secondary' | 'tertiary';
  active: boolean;
  effectiveDate: Date;
  expirationDate?: Date;
}

export interface ClinicalSummary {
  activeConditions: Condition[];
  activeMedications: MedicationRequest[];
  allergies: AllergyIntolerance[];
  recentEncounters: Encounter[];
  recentObservations: Observation[];
  aiGeneratedSummary?: string;
  lastEncounterDate?: Date;
}

export interface AllergyIntolerance extends FHIRResource {
  resourceType: 'AllergyIntolerance';
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  type?: 'allergy' | 'intolerance';
  category?: ('food' | 'medication' | 'environment' | 'biologic')[];
  criticality?: 'low' | 'high' | 'unable-to-assess';
  code?: CodeableConcept;
  patient: Reference;
  encounter?: Reference;
  onsetDateTime?: string;
  recordedDate?: string;
  recorder?: Reference;
  asserter?: Reference;
  lastOccurrence?: string;
  note?: Annotation[];
  reaction?: AllergyIntoleranceReaction[];
}

export interface AllergyIntoleranceReaction {
  substance?: CodeableConcept;
  manifestation: CodeableConcept[];
  description?: string;
  onset?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  exposureRoute?: CodeableConcept;
  note?: Annotation[];
}

export interface EngagementMetrics {
  appointmentHistory: AppointmentHistory;
  portalUsage: PortalUsage;
  communicationPreferences: CommunicationPreferences;
  satisfactionScores: SatisfactionScores;
  engagementScore: number; // 0-100
}

export interface AppointmentHistory {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  noShowRate: number; // percentage
  averageLeadTime: number; // days
  lastAppointmentDate?: Date;
  nextAppointmentDate?: Date;
}

export interface PortalUsage {
  lastLogin?: Date;
  totalLogins: number;
  messagesExchanged: number;
  documentsViewed: number;
  billsPaid: number;
}

export interface CommunicationPreferences {
  preferredMethod: 'email' | 'sms' | 'phone' | 'portal';
  emailConsent: boolean;
  smsConsent: boolean;
  marketingConsent: boolean;
  reminderConsent: boolean;
}

export interface SatisfactionScores {
  nps?: number; // Net Promoter Score (-100 to 100)
  lastSurveyDate?: Date;
  averageRating?: number; // 1-5
  feedbackCount: number;
}

export interface FinancialSummary {
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  paymentMethod?: string;
  lifetimeValue: number;
}

export interface MarketingAttribution {
  leadSource: string;
  campaignId?: string;
  acquisitionDate: Date;
  acquisitionCost?: number;
  touchpoints: MarketingTouchpoint[];
}

export interface MarketingTouchpoint {
  date: Date;
  channel: string;
  campaign?: string;
  action: string;
  metadata?: Record<string, any>;
}

export interface RiskScores {
  churnRisk: number; // 0-1
  noShowRisk: number; // 0-1
  healthRisk?: number; // 0-1
  financialRisk?: number; // 0-1
  lastCalculated: Date;
}

// ==================== Scheduling Types ====================

export interface SchedulingSlot {
  slotId: string;
  providerId: string;
  locationId: string;
  start: Date;
  end: Date;
  appointmentType: string;
  status: 'available' | 'booked' | 'blocked' | 'tentative';
  capacity: number;
  currentBookings: number;
}

export interface SchedulingOptimization {
  providerId: string;
  date: Date;
  utilization: number; // percentage
  overbookingRecommendation: number;
  balanceScore: number; // 0-100
  recommendations: SchedulingRecommendation[];
}

export interface SchedulingRecommendation {
  action: 'add_slot' | 'remove_slot' | 'adjust_duration' | 'redistribute';
  timeSlot: { start: Date; end: Date };
  reason: string;
  impact: number; // expected improvement
}

// ==================== Revenue Ops Types ====================

export interface BillingClaim {
  claimId: string;
  patientId: string;
  encounterId: string;
  providerId: string;
  claimDate: Date;
  serviceDate: Date;
  insuranceId: string;
  procedures: BillingProcedure[];
  diagnoses: string[]; // ICD-10 codes
  totalCharged: number;
  totalAllowed?: number;
  totalPaid?: number;
  patientResponsibility?: number;
  status: 'draft' | 'submitted' | 'pending' | 'paid' | 'denied' | 'appealed';
  submittedDate?: Date;
  paidDate?: Date;
  denialReason?: string;
  anomalyScore?: number; // AI-detected anomaly (0-1)
  anomalyReasons?: string[];
}

export interface BillingProcedure {
  code: string; // CPT code
  description: string;
  modifier?: string[];
  units: number;
  chargeAmount: number;
  allowedAmount?: number;
  paidAmount?: number;
}

export interface RevenueForecasting {
  forecastDate: Date;
  period: 'week' | 'month' | 'quarter' | 'year';
  expectedRevenue: number;
  confidence: number; // 0-1
  breakdown: RevenueBreakdown[];
}

export interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

// ==================== Enterprise Intelligence Types ====================

export interface ExecutiveDashboard {
  organizationId: string;
  period: Period;
  kpis: KPIMetrics;
  trends: TrendAnalysis[];
  alerts: Alert[];
  generatedAt: Date;
}

export interface KPIMetrics {
  clinical: ClinicalKPIs;
  operational: OperationalKPIs;
  financial: FinancialKPIs;
  patient: PatientKPIs;
  ai: AIPerformanceKPIs;
}

export interface ClinicalKPIs {
  avgPatientsPerProvider: number;
  avgEncounterDuration: number; // minutes
  documentationTime: number; // minutes
  clinicalProductivityScore: number; // 0-100
  aiDocumentationAdoption: number; // percentage
}

export interface OperationalKPIs {
  appointmentUtilization: number; // percentage
  noShowRate: number; // percentage
  avgWaitTime: number; // minutes
  patientSatisfactionNPS: number;
  staffEfficiencyScore: number; // 0-100
}

export interface FinancialKPIs {
  totalRevenue: number;
  collectionRate: number; // percentage
  daysInAR: number;
  denialRate: number; // percentage
  costPerVisit: number;
  revenuePerProvider: number;
}

export interface PatientKPIs {
  activePatients: number;
  newPatients: number;
  retentionRate: number; // percentage
  avgLifetimeValue: number;
  engagementScore: number; // 0-100
}

export interface AIPerformanceKPIs {
  modelAccuracy: number; // percentage
  clinicianOverrideRate: number; // percentage
  avgInferenceTime: number; // milliseconds
  predictionConfidence: number; // 0-1
  federatedLearningNodes: number;
}

export interface TrendAnalysis {
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'stable';
  forecast?: number[];
}

export interface Alert {
  alertId: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'clinical' | 'operational' | 'financial' | 'compliance' | 'ai';
  title: string;
  description: string;
  actionRequired?: string;
  createdAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

// ==================== Multi-Tenant Types ====================

export interface Organization {
  organizationId: string;
  name: string;
  type: 'clinic' | 'hospital' | 'health_system' | 'telehealth';
  tier: 'starter' | 'practice' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  settings: OrganizationSettings;
  subscription: Subscription;
  locations: Location[];
  providers: Provider[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  timezone: string;
  locale: string;
  features: FeatureFlags;
  branding?: BrandingSettings;
  integrations: IntegrationSettings;
}

export interface FeatureFlags {
  aiDocumentation: boolean;
  predictiveScheduling: boolean;
  federatedLearning: boolean;
  ghlIntegration: boolean;
  epicIntegration: boolean;
  revenueOps: boolean;
  enterpriseIntelligence: boolean;
}

export interface BrandingSettings {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
}

export interface IntegrationSettings {
  fhir: FHIRIntegration[];
  ghl?: GHLIntegration;
  stripe?: StripeIntegration;
  quickbooks?: QuickBooksIntegration;
}

export interface FHIRIntegration {
  provider: 'epic' | 'icanotes' | 'tebra' | 'other';
  baseUrl: string;
  clientId: string;
  enabled: boolean;
  lastSync?: Date;
}

export interface GHLIntegration {
  apiKey: string;
  locationId: string;
  webhookUrl: string;
  enabled: boolean;
}

export interface StripeIntegration {
  accountId: string;
  publishableKey: string;
  enabled: boolean;
}

export interface QuickBooksIntegration {
  realmId: string;
  accessToken: string;
  refreshToken: string;
  enabled: boolean;
}

export interface Subscription {
  subscriptionId: string;
  tier: 'starter' | 'practice' | 'enterprise';
  status: 'trial' | 'active' | 'past_due' | 'cancelled';
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  startDate: Date;
  renewalDate: Date;
  trialEndDate?: Date;
  cancelledAt?: Date;
}

export interface Location {
  locationId: string;
  organizationId: string;
  name: string;
  type: 'primary' | 'satellite' | 'telehealth';
  address: Address;
  phone: ContactPoint;
  hours: BusinessHours[];
  active: boolean;
}

export interface BusinessHours {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  closed: boolean;
}

export interface Provider {
  providerId: string;
  organizationId: string;
  npi: string;
  name: HumanName;
  specialty: CodeableConcept[];
  credentials: string[];
  locations: string[]; // locationIds
  schedules: ProviderSchedule[];
  active: boolean;
}

export interface ProviderSchedule {
  scheduleId: string;
  providerId: string;
  locationId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  appointmentTypes: string[];
  slotDuration: number; // minutes
  active: boolean;
}

// ==================== API Response Types ====================

export interface APIResponse<T = any> {
  data?: T;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
  errors?: APIError[];
}

export interface APIError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ==================== Event Types (Kafka) ====================

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  timestamp: Date;
  userId?: string;
  organizationId: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
}

export type PatientEvent =
  | { type: 'PatientCreated'; payload: Patient }
  | { type: 'PatientUpdated'; payload: Patient }
  | { type: 'PatientDeleted'; payload: { patientId: string } };

export type AppointmentEvent =
  | { type: 'AppointmentScheduled'; payload: Appointment }
  | { type: 'AppointmentCancelled'; payload: Appointment }
  | { type: 'AppointmentCompleted'; payload: Appointment }
  | { type: 'AppointmentNoShow'; payload: Appointment };

export type ClinicalEvent =
  | { type: 'EncounterStarted'; payload: Encounter }
  | { type: 'EncounterCompleted'; payload: Encounter }
  | { type: 'ClinicalNoteGenerated'; payload: ClinicalNote }
  | { type: 'ClinicalNoteApproved'; payload: ClinicalNote };
