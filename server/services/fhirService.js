const FHIRClient = require('fhir-kit-client');
const logger = require('../utils/logger');
const { encryptData, decryptData } = require('../utils/encryption');
const auditLogger = require('../utils/auditLogger');

class FHIRIntegrationService {
  constructor() {
    this.clients = new Map();
    this.initializeClients();
  }

  initializeClients() {
    // Epic FHIR Client
    if (process.env.EPIC_CLIENT_ID) {
      this.clients.set('epic', new FHIRClient({
        baseUrl: process.env.EPIC_SANDBOX_URL,
        customHeaders: {
          'Epic-Client-ID': process.env.EPIC_CLIENT_ID
        }
      }));
    }

    // Generic FHIR R4 Client
    this.clients.set('generic', new FHIRClient({
      baseUrl: 'https://hapi.fhir.org/baseR4'
    }));

    logger.info('FHIR clients initialized');
  }

  async authenticateEpic() {
    try {
      const authUrl = `${process.env.EPIC_SANDBOX_URL}/oauth2/authorize`;
      const tokenUrl = `${process.env.EPIC_SANDBOX_URL}/oauth2/token`;
      
      // OAuth 2.0 flow for Epic
      const authParams = {
        response_type: 'code',
        client_id: process.env.EPIC_CLIENT_ID,
        redirect_uri: `${process.env.SERVER_URL}/api/fhir/epic/callback`,
        scope: 'patient/*.read'
      };

      return { authUrl, authParams };
    } catch (error) {
      logger.error('Epic authentication error:', error);
      throw error;
    }
  }

  async getPatient(patientId, system = 'generic') {
    try {
      const client = this.clients.get(system);
      if (!client) {
        throw new Error(`FHIR client not found for system: ${system}`);
      }

      const patient = await client.read({
        resourceType: 'Patient',
        id: patientId
      });

      // Log access for HIPAA audit
      auditLogger.logDataAccess({
        resourceType: 'Patient',
        resourceId: patientId,
        action: 'read',
        system: system,
        timestamp: new Date().toISOString()
      });

      return this.transformPatientData(patient);
    } catch (error) {
      logger.error('Error fetching patient:', error);
      throw error;
    }
  }

  async searchPatients(searchParams, system = 'generic') {
    try {
      const client = this.clients.get(system);
      const results = await client.search({
        resourceType: 'Patient',
        searchParams: searchParams
      });

      return results.entry?.map(entry => this.transformPatientData(entry.resource)) || [];
    } catch (error) {
      logger.error('Error searching patients:', error);
      throw error;
    }
  }

  async getObservations(patientId, category = null, system = 'generic') {
    try {
      const client = this.clients.get(system);
      const searchParams = {
        patient: patientId,
        _sort: '-date'
      };

      if (category) {
        searchParams.category = category;
      }

      const observations = await client.search({
        resourceType: 'Observation',
        searchParams: searchParams
      });

      return observations.entry?.map(entry => this.transformObservationData(entry.resource)) || [];
    } catch (error) {
      logger.error('Error fetching observations:', error);
      throw error;
    }
  }

  async getConditions(patientId, system = 'generic') {
    try {
      const client = this.clients.get(system);
      const conditions = await client.search({
        resourceType: 'Condition',
        searchParams: {
          patient: patientId,
          _sort: '-onset-date'
        }
      });

      return conditions.entry?.map(entry => this.transformConditionData(entry.resource)) || [];
    } catch (error) {
      logger.error('Error fetching conditions:', error);
      throw error;
    }
  }

  async getMedications(patientId, system = 'generic') {
    try {
      const client = this.clients.get(system);
      const medications = await client.search({
        resourceType: 'MedicationRequest',
        searchParams: {
          patient: patientId,
          status: 'active',
          _sort: '-authored-on'
        }
      });

      return medications.entry?.map(entry => this.transformMedicationData(entry.resource)) || [];
    } catch (error) {
      logger.error('Error fetching medications:', error);
      throw error;
    }
  }

  async createEncounter(encounterData, system = 'generic') {
    try {
      const client = this.clients.get(system);
      const fhirEncounter = this.transformToFHIREncounter(encounterData);
      
      const result = await client.create({
        resourceType: 'Encounter',
        body: fhirEncounter
      });

      auditLogger.logDataCreation({
        resourceType: 'Encounter',
        resourceId: result.id,
        system: system,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      logger.error('Error creating encounter:', error);
      throw error;
    }
  }

  async createObservation(observationData, system = 'generic') {
    try {
      const client = this.clients.get(system);
      const fhirObservation = this.transformToFHIRObservation(observationData);
      
      const result = await client.create({
        resourceType: 'Observation',
        body: fhirObservation
      });

      return result;
    } catch (error) {
      logger.error('Error creating observation:', error);
      throw error;
    }
  }

  transformPatientData(fhirPatient) {
    return {
      id: fhirPatient.id,
      identifier: fhirPatient.identifier?.[0]?.value,
      name: {
        first: fhirPatient.name?.[0]?.given?.[0],
        last: fhirPatient.name?.[0]?.family,
        full: `${fhirPatient.name?.[0]?.given?.[0] || ''} ${fhirPatient.name?.[0]?.family || ''}`.trim()
      },
      gender: fhirPatient.gender,
      birthDate: fhirPatient.birthDate,
      phone: fhirPatient.telecom?.find(t => t.system === 'phone')?.value,
      email: fhirPatient.telecom?.find(t => t.system === 'email')?.value,
      address: fhirPatient.address?.[0] ? {
        line: fhirPatient.address[0].line?.join(', '),
        city: fhirPatient.address[0].city,
        state: fhirPatient.address[0].state,
        postalCode: fhirPatient.address[0].postalCode,
        country: fhirPatient.address[0].country
      } : null,
      maritalStatus: fhirPatient.maritalStatus?.coding?.[0]?.display,
      language: fhirPatient.communication?.[0]?.language?.coding?.[0]?.display
    };
  }

  transformObservationData(fhirObservation) {
    return {
      id: fhirObservation.id,
      status: fhirObservation.status,
      category: fhirObservation.category?.[0]?.coding?.[0]?.display,
      code: {
        system: fhirObservation.code?.coding?.[0]?.system,
        code: fhirObservation.code?.coding?.[0]?.code,
        display: fhirObservation.code?.coding?.[0]?.display
      },
      value: this.extractObservationValue(fhirObservation),
      unit: fhirObservation.valueQuantity?.unit,
      effectiveDateTime: fhirObservation.effectiveDateTime,
      issued: fhirObservation.issued,
      performer: fhirObservation.performer?.[0]?.display
    };
  }

  transformConditionData(fhirCondition) {
    return {
      id: fhirCondition.id,
      clinicalStatus: fhirCondition.clinicalStatus?.coding?.[0]?.code,
      verificationStatus: fhirCondition.verificationStatus?.coding?.[0]?.code,
      category: fhirCondition.category?.[0]?.coding?.[0]?.display,
      code: {
        system: fhirCondition.code?.coding?.[0]?.system,
        code: fhirCondition.code?.coding?.[0]?.code,
        display: fhirCondition.code?.coding?.[0]?.display
      },
      onsetDateTime: fhirCondition.onsetDateTime,
      recordedDate: fhirCondition.recordedDate,
      severity: fhirCondition.severity?.coding?.[0]?.display
    };
  }

  transformMedicationData(fhirMedication) {
    return {
      id: fhirMedication.id,
      status: fhirMedication.status,
      intent: fhirMedication.intent,
      medication: {
        system: fhirMedication.medicationCodeableConcept?.coding?.[0]?.system,
        code: fhirMedication.medicationCodeableConcept?.coding?.[0]?.code,
        display: fhirMedication.medicationCodeableConcept?.coding?.[0]?.display
      },
      dosage: fhirMedication.dosageInstruction?.[0]?.text,
      authoredOn: fhirMedication.authoredOn,
      requester: fhirMedication.requester?.display
    };
  }

  extractObservationValue(observation) {
    if (observation.valueQuantity) {
      return observation.valueQuantity.value;
    } else if (observation.valueString) {
      return observation.valueString;
    } else if (observation.valueBoolean !== undefined) {
      return observation.valueBoolean;
    } else if (observation.valueCodeableConcept) {
      return observation.valueCodeableConcept.coding?.[0]?.display;
    }
    return null;
  }

  transformToFHIREncounter(encounterData) {
    return {
      resourceType: 'Encounter',
      status: encounterData.status || 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: encounterData.class || 'AMB',
        display: encounterData.classDisplay || 'ambulatory'
      },
      subject: {
        reference: `Patient/${encounterData.patientId}`
      },
      period: {
        start: encounterData.startTime,
        end: encounterData.endTime
      },
      reasonCode: encounterData.reasonCodes?.map(code => ({
        coding: [{
          system: code.system,
          code: code.code,
          display: code.display
        }]
      })),
      participant: encounterData.providers?.map(provider => ({
        individual: {
          reference: `Practitioner/${provider.id}`,
          display: provider.name
        }
      }))
    };
  }

  transformToFHIRObservation(observationData) {
    return {
      resourceType: 'Observation',
      status: observationData.status || 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: observationData.category || 'vital-signs',
          display: observationData.categoryDisplay || 'Vital Signs'
        }]
      }],
      code: {
        coding: [{
          system: observationData.code.system,
          code: observationData.code.code,
          display: observationData.code.display
        }]
      },
      subject: {
        reference: `Patient/${observationData.patientId}`
      },
      effectiveDateTime: observationData.effectiveDateTime || new Date().toISOString(),
      valueQuantity: observationData.value ? {
        value: observationData.value,
        unit: observationData.unit,
        system: 'http://unitsofmeasure.org'
      } : undefined
    };
  }

  // Federated learning support - anonymize data for cross-institution learning
  async anonymizeForFederatedLearning(patientData) {
    try {
      // Remove direct identifiers
      const anonymized = {
        demographics: {
          ageGroup: this.getAgeGroup(patientData.birthDate),
          gender: patientData.gender,
          region: this.getRegion(patientData.address?.state)
        },
        conditions: patientData.conditions?.map(condition => ({
          code: condition.code.code,
          system: condition.code.system,
          category: condition.category
        })),
        observations: patientData.observations?.map(obs => ({
          code: obs.code.code,
          category: obs.category,
          valueRange: this.getValueRange(obs.value),
          unit: obs.unit
        })),
        medications: patientData.medications?.map(med => ({
          code: med.medication.code,
          category: this.getMedicationCategory(med.medication.code)
        }))
      };

      return anonymized;
    } catch (error) {
      logger.error('Error anonymizing data for federated learning:', error);
      throw error;
    }
  }

  getAgeGroup(birthDate) {
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    if (age < 18) return '0-17';
    if (age < 30) return '18-29';
    if (age < 50) return '30-49';
    if (age < 65) return '50-64';
    return '65+';
  }

  getRegion(state) {
    const regions = {
      'CA': 'West', 'OR': 'West', 'WA': 'West',
      'TX': 'South', 'FL': 'South', 'GA': 'South',
      'NY': 'Northeast', 'MA': 'Northeast', 'CT': 'Northeast',
      'IL': 'Midwest', 'OH': 'Midwest', 'MI': 'Midwest'
    };
    return regions[state] || 'Other';
  }

  getValueRange(value) {
    if (typeof value !== 'number') return null;
    
    // Create ranges to preserve privacy while maintaining utility
    const ranges = [
      { min: 0, max: 10 },
      { min: 10, max: 50 },
      { min: 50, max: 100 },
      { min: 100, max: 200 },
      { min: 200, max: 500 },
      { min: 500, max: Infinity }
    ];

    return ranges.find(range => value >= range.min && value < range.max);
  }

  getMedicationCategory(medicationCode) {
    // Simplified medication categorization
    const categories = {
      'lisinopril': 'ACE Inhibitor',
      'metformin': 'Antidiabetic',
      'atorvastatin': 'Statin',
      'amlodipine': 'Calcium Channel Blocker'
    };
    
    return categories[medicationCode.toLowerCase()] || 'Other';
  }
}

module.exports = new FHIRIntegrationService();