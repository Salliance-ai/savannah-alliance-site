const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');
const { encryptData, decryptData } = require('../utils/encryption');

class ACREAIEngine {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Medical knowledge base and clinical reasoning patterns
    this.medicalKnowledgeBase = {
      icd10Codes: new Map(),
      clinicalGuidelines: new Map(),
      drugInteractions: new Map(),
      diagnosticCriteria: new Map()
    };

    this.initializeMedicalKB();
  }

  async initializeMedicalKB() {
    // Load medical knowledge base (in production, this would be from a medical database)
    logger.info('Initializing ACRE Medical Knowledge Base...');
    
    // Sample ICD-10 codes
    this.medicalKnowledgeBase.icd10Codes.set('hypertension', {
      code: 'I10',
      description: 'Essential hypertension',
      category: 'Cardiovascular'
    });
    
    this.medicalKnowledgeBase.icd10Codes.set('diabetes_type2', {
      code: 'E11',
      description: 'Type 2 diabetes mellitus',
      category: 'Endocrine'
    });

    // Clinical guidelines
    this.medicalKnowledgeBase.clinicalGuidelines.set('hypertension_management', {
      condition: 'Hypertension',
      guidelines: [
        'Blood pressure target <130/80 mmHg for most adults',
        'Lifestyle modifications: diet, exercise, weight management',
        'First-line medications: ACE inhibitors, ARBs, thiazide diuretics, CCBs'
      ],
      evidenceLevel: 'A'
    });

    logger.info('Medical Knowledge Base initialized');
  }

  async generateClinicalSummary(patientData, encounterNotes) {
    try {
      const prompt = `
        As a medical AI assistant trained on FHIR standards and evidence-based medicine, 
        generate a comprehensive clinical summary for the following patient encounter:

        Patient Data: ${JSON.stringify(patientData, null, 2)}
        Encounter Notes: ${encounterNotes}

        Please provide:
        1. Chief Complaint Summary
        2. Assessment and Plan
        3. Recommended ICD-10 codes
        4. Follow-up recommendations
        5. Clinical decision rationale

        Format as structured JSON with HIPAA-compliant language.
      `;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const summary = JSON.parse(response.content[0].text);
      
      // Log for audit trail
      logger.info('Clinical summary generated', {
        patientId: patientData.id,
        timestamp: new Date().toISOString(),
        aiModel: 'claude-3-sonnet'
      });

      return summary;
    } catch (error) {
      logger.error('Error generating clinical summary:', error);
      throw new Error('Failed to generate clinical summary');
    }
  }

  async suggestICD10Codes(symptoms, diagnosis) {
    try {
      const prompt = `
        Based on the following symptoms and preliminary diagnosis, suggest appropriate ICD-10 codes:
        
        Symptoms: ${symptoms.join(', ')}
        Diagnosis: ${diagnosis}
        
        Provide the top 3 most appropriate ICD-10 codes with confidence scores and rationale.
        Format as JSON array.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{
          role: 'system',
          content: 'You are a medical coding specialist with expertise in ICD-10 classification.'
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.1
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Error suggesting ICD-10 codes:', error);
      throw new Error('Failed to suggest ICD-10 codes');
    }
  }

  async predictPatientRisk(patientHistory, vitalSigns, labResults) {
    try {
      const riskFactors = this.analyzeRiskFactors(patientHistory, vitalSigns, labResults);
      
      const prompt = `
        Analyze the following patient data and provide a comprehensive risk assessment:
        
        Risk Factors: ${JSON.stringify(riskFactors, null, 2)}
        
        Provide:
        1. Overall risk score (0-100)
        2. Specific risk categories (cardiovascular, diabetes, etc.)
        3. Recommended interventions
        4. Follow-up timeline
        5. Clinical reasoning
        
        Format as structured JSON.
      `;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      logger.error('Error predicting patient risk:', error);
      throw new Error('Failed to predict patient risk');
    }
  }

  analyzeRiskFactors(patientHistory, vitalSigns, labResults) {
    const riskFactors = {
      demographic: {},
      clinical: {},
      lifestyle: {},
      familyHistory: {}
    };

    // Analyze vital signs
    if (vitalSigns.bloodPressure) {
      const [systolic, diastolic] = vitalSigns.bloodPressure.split('/').map(Number);
      if (systolic >= 140 || diastolic >= 90) {
        riskFactors.clinical.hypertension = 'elevated';
      }
    }

    // Analyze lab results
    if (labResults.hba1c && labResults.hba1c >= 6.5) {
      riskFactors.clinical.diabetes = 'indicated';
    }

    if (labResults.cholesterol && labResults.cholesterol >= 240) {
      riskFactors.clinical.hyperlipidemia = 'elevated';
    }

    return riskFactors;
  }

  async generateTreatmentPlan(diagnosis, patientProfile, clinicalGuidelines) {
    try {
      const prompt = `
        Generate an evidence-based treatment plan for:
        
        Diagnosis: ${diagnosis}
        Patient Profile: ${JSON.stringify(patientProfile, null, 2)}
        
        Consider:
        1. Current clinical guidelines
        2. Patient-specific factors (age, comorbidities, allergies)
        3. Evidence-based interventions
        4. Monitoring requirements
        5. Patient education needs
        
        Provide structured treatment plan with rationale.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{
          role: 'system',
          content: 'You are a clinical decision support AI trained on evidence-based medicine and clinical guidelines.'
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.2
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Error generating treatment plan:', error);
      throw new Error('Failed to generate treatment plan');
    }
  }

  async analyzeClinicalTrends(patientData, timeframe = '6months') {
    try {
      // Analyze trends in patient data over time
      const trends = {
        vitalSigns: this.analyzeVitalTrends(patientData.vitals),
        labResults: this.analyzeLabTrends(patientData.labs),
        medications: this.analyzeMedicationAdherence(patientData.medications),
        appointments: this.analyzeAppointmentPatterns(patientData.appointments)
      };

      return trends;
    } catch (error) {
      logger.error('Error analyzing clinical trends:', error);
      throw new Error('Failed to analyze clinical trends');
    }
  }

  analyzeVitalTrends(vitals) {
    // Implement trend analysis for vital signs
    return {
      bloodPressure: 'stable',
      weight: 'increasing',
      heartRate: 'normal_range'
    };
  }

  analyzeLabTrends(labs) {
    // Implement trend analysis for lab results
    return {
      hba1c: 'improving',
      cholesterol: 'stable',
      creatinine: 'normal'
    };
  }

  analyzeMedicationAdherence(medications) {
    // Implement medication adherence analysis
    return {
      overallAdherence: 85,
      missedDoses: 3,
      sideEffects: []
    };
  }

  analyzeAppointmentPatterns(appointments) {
    // Implement appointment pattern analysis
    return {
      adherence: 'good',
      noShowRate: 0.1,
      rescheduleRate: 0.15
    };
  }
}

module.exports = new ACREAIEngine();