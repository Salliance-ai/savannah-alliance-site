// ClinicalOps AI - Documentation, ICD Coding, Treatment Plans

import express, { Router } from 'express';
import { ClinicalNote, ICDCode, ACREReasoningRequest } from '../../shared/types/index.js';
import { authenticateToken, AuthRequest } from '../../shared/middleware/auth.js';
import { hipaaAuditLog } from '../../shared/middleware/compliance.js';
import axios from 'axios';

const router = Router();

// ClinicalOps Service
class ClinicalOpsService {
  /**
   * Generate clinical documentation with AI assistance
   */
  async generateDocumentation(
    tenantId: string,
    providerId: string,
    patientId: string,
    encounterData: any
  ): Promise<ClinicalNote> {
    // In production, call ACRE service
    const acreRequest: ACREReasoningRequest = {
      context: {
        patientId,
        clinicalData: encounterData,
      },
      task: 'documentation',
      requirements: {
        evidenceBased: true,
        complianceCheck: true,
      },
    };

    // Call ACRE service
    const acreResponse = await this.callACRE(acreRequest);

    const note: ClinicalNote = {
      id: this.generateId(),
      tenantId,
      providerId,
      patientId,
      encounterDate: new Date(),
      noteType: 'progress',
      content: acreResponse.output?.suggestedNote || 'Clinical note generated',
      aiGenerated: true,
      icdCodes: acreResponse.output?.suggestedICDCodes || [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return note;
  }

  /**
   * Auto-code clinical encounter with ICD-10 codes
   */
  async autoCode(
    tenantId: string,
    providerId: string,
    patientId: string,
    clinicalData: any
  ): Promise<ICDCode[]> {
    const acreRequest: ACREReasoningRequest = {
      context: {
        patientId,
        clinicalData,
      },
      task: 'coding',
      requirements: {
        complianceCheck: true,
      },
    };

    const acreResponse = await this.callACRE(acreRequest);
    return acreResponse.output?.suggestedICDCodes || [];
  }

  /**
   * Generate treatment plan recommendations
   */
  async generateTreatmentPlan(
    tenantId: string,
    providerId: string,
    patientId: string,
    diagnosis: string,
    specialty?: string
  ): Promise<any> {
    const acreRequest: ACREReasoningRequest = {
      context: {
        patientId,
        clinicalData: { diagnosis },
      },
      task: 'treatment_planning',
      specialty,
      requirements: {
        evidenceBased: true,
      },
    };

    const acreResponse = await this.callACRE(acreRequest);
    return acreResponse.output || {};
  }

  /**
   * Predict follow-up appointment likelihood
   */
  async predictFollowUp(
    tenantId: string,
    patientId: string,
    encounterData: any
  ): Promise<{
    likelihood: number;
    recommendedDays: number;
    riskFactors: string[];
  }> {
    // Simulate predictive model
    const riskFactors: string[] = [];
    
    if (encounterData.acuteCondition) {
      riskFactors.push('Acute condition requires monitoring');
      return {
        likelihood: 0.85,
        recommendedDays: 7,
        riskFactors,
      };
    }

    if (encounterData.chronicCondition) {
      riskFactors.push('Chronic condition management');
      return {
        likelihood: 0.70,
        recommendedDays: 30,
        riskFactors,
      };
    }

    return {
      likelihood: 0.50,
      recommendedDays: 90,
      riskFactors: ['Routine follow-up recommended'],
    };
  }

  private async callACRE(request: ACREReasoningRequest): Promise<any> {
    try {
      // In production, call ACRE service via HTTP
      const acreUrl = process.env.ACRE_SERVICE_URL || 'http://localhost:3001';
      const response = await axios.post(`${acreUrl}/reason`, request);
      return response.data;
    } catch (error) {
      console.error('[ClinicalOps] ACRE call failed:', error);
      // Fallback response
      return {
        output: {
          suggestedNote: 'Clinical documentation template',
          suggestedICDCodes: [],
        },
      };
    }
  }

  private generateId(): string {
    return `cln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

const clinicalOpsService = new ClinicalOpsService();

// API Routes
router.post('/documentation/generate', authenticateToken, hipaaAuditLog, async (req: AuthRequest, res) => {
  try {
    const { patientId, encounterData } = req.body;

    if (!patientId || !encounterData) {
      res.status(400).json({ error: 'Missing required fields: patientId, encounterData' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const note = await clinicalOpsService.generateDocumentation(
      req.user.tenantId,
      req.user.providerId || req.user.id,
      patientId,
      encounterData
    );

    res.json(note);
  } catch (error: any) {
    console.error('[ClinicalOps Error]', error);
    res.status(500).json({ error: 'Failed to generate documentation', details: error.message });
  }
});

router.post('/coding/auto-code', authenticateToken, hipaaAuditLog, async (req: AuthRequest, res) => {
  try {
    const { patientId, clinicalData } = req.body;

    if (!patientId || !clinicalData) {
      res.status(400).json({ error: 'Missing required fields: patientId, clinicalData' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const codes = await clinicalOpsService.autoCode(
      req.user.tenantId,
      req.user.providerId || req.user.id,
      patientId,
      clinicalData
    );

    res.json({ icdCodes: codes });
  } catch (error: any) {
    console.error('[ClinicalOps Error]', error);
    res.status(500).json({ error: 'Failed to auto-code', details: error.message });
  }
});

router.post('/treatment-plan/generate', authenticateToken, hipaaAuditLog, async (req: AuthRequest, res) => {
  try {
    const { patientId, diagnosis, specialty } = req.body;

    if (!patientId || !diagnosis) {
      res.status(400).json({ error: 'Missing required fields: patientId, diagnosis' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const plan = await clinicalOpsService.generateTreatmentPlan(
      req.user.tenantId,
      req.user.providerId || req.user.id,
      patientId,
      diagnosis,
      specialty
    );

    res.json(plan);
  } catch (error: any) {
    console.error('[ClinicalOps Error]', error);
    res.status(500).json({ error: 'Failed to generate treatment plan', details: error.message });
  }
});

router.post('/follow-up/predict', authenticateToken, hipaaAuditLog, async (req: AuthRequest, res) => {
  try {
    const { patientId, encounterData } = req.body;

    if (!patientId || !encounterData) {
      res.status(400).json({ error: 'Missing required fields: patientId, encounterData' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const prediction = await clinicalOpsService.predictFollowUp(
      req.user.tenantId,
      patientId,
      encounterData
    );

    res.json(prediction);
  } catch (error: any) {
    console.error('[ClinicalOps Error]', error);
    res.status(500).json({ error: 'Failed to predict follow-up', details: error.message });
  }
});

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ClinicalOps',
    version: '1.0.0',
    capabilities: [
      'documentation_generation',
      'auto_coding',
      'treatment_planning',
      'follow_up_prediction',
    ],
  });
});

export default router;
