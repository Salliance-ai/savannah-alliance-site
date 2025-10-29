// Patient360 Hub - Unified patient profile with behavioral, clinical, and engagement metrics

import express, { Router } from 'express';
import { Patient360Profile, Patient } from '../../shared/types/index.js';
import { authenticateToken, AuthRequest } from '../../shared/middleware/auth.js';
import { hipaaAuditLog } from '../../shared/middleware/compliance.js';

const router = Router();

// Patient360 Service
class Patient360Service {
  /**
   * Get unified 360-degree patient profile
   */
  async getPatientProfile(
    tenantId: string,
    patientId: string
  ): Promise<Patient360Profile> {
    // In production, aggregate data from multiple sources
    const profile: Patient360Profile = {
      patientId,
      tenantId,
      clinical: {
        diagnoses: [
          { code: 'E11.9', description: 'Type 2 diabetes mellitus', version: 'ICD-10-CM' },
        ],
        medications: [
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
        ],
        allergies: [],
        vitalSigns: [
          {
            type: 'blood_pressure',
            value: 120,
            unit: 'mmHg',
            recordedAt: new Date(Date.now() - 86400000), // 1 day ago
          },
        ],
        lastVisit: new Date(Date.now() - 30 * 86400000), // 30 days ago
      },
      engagement: {
        appointmentAdherence: 0.85, // 85%
        communicationResponsiveness: 0.72,
        portalUsage: 0.45,
        satisfactionScore: 4.2,
      },
      behavioral: {
        riskScore: 0.35,
        predictedChurn: 0.25,
        nextAppointmentLikelihood: 0.78,
        preferredContactMethod: 'email',
      },
      updatedAt: new Date(),
    };

    return profile;
  }

  /**
   * Generate AI care summary for continuity
   */
  async generateCareSummary(
    tenantId: string,
    patientId: string,
    timeframe?: { start: Date; end: Date }
  ): Promise<{
    summary: string;
    keyPoints: string[];
    recommendations: string[];
    generatedAt: Date;
  }> {
    const profile = await this.getPatientProfile(tenantId, patientId);

    const summary = `Patient Summary (${timeframe?.start ? timeframe.start.toISOString().split('T')[0] : 'All Time'})\n\n` +
      `Clinical Status: Patient presents with ${profile.clinical.diagnoses.map(d => d.description).join(', ')}. ` +
      `Current medications: ${profile.clinical.medications.map(m => m.name).join(', ')}.\n\n` +
      `Engagement: ${(profile.engagement.appointmentAdherence * 100).toFixed(0)}% appointment adherence. ` +
      `Patient is ${profile.engagement.communicationResponsiveness > 0.7 ? 'highly' : 'moderately'} responsive to communications.\n\n` +
      `Risk Assessment: Overall risk score ${(profile.behavioral.riskScore * 100).toFixed(0)}%. ` +
      `Churn risk: ${(profile.behavioral.predictedChurn * 100).toFixed(0)}%. ` +
      `Likelihood of next appointment: ${(profile.behavioral.nextAppointmentLikelihood * 100).toFixed(0)}%.`;

    const keyPoints = [
      `Primary diagnosis: ${profile.clinical.diagnoses[0]?.description}`,
      `Last visit: ${profile.clinical.lastVisit?.toLocaleDateString()}`,
      `Appointment adherence: ${(profile.engagement.appointmentAdherence * 100).toFixed(0)}%`,
      `Preferred contact: ${profile.behavioral.preferredContactMethod}`,
    ];

    const recommendations = [];
    if (profile.behavioral.predictedChurn > 0.3) {
      recommendations.push('Proactive outreach recommended to reduce churn risk');
    }
    if (profile.engagement.appointmentAdherence < 0.8) {
      recommendations.push('Improve appointment reminders to increase adherence');
    }
    if (profile.clinical.lastVisit && 
        (Date.now() - profile.clinical.lastVisit.getTime()) > 90 * 86400000) {
      recommendations.push('Schedule follow-up appointment (overdue)');
    }

    return {
      summary,
      keyPoints,
      recommendations,
      generatedAt: new Date(),
    };
  }

  /**
   * Calculate patient engagement score
   */
  async calculateEngagementScore(
    tenantId: string,
    patientId: string
  ): Promise<{
    score: number;
    factors: Array<{ factor: string; contribution: number }>;
    trend: 'improving' | 'stable' | 'declining';
  }> {
    const profile = await this.getPatientProfile(tenantId, patientId);

    const factors = [
      {
        factor: 'Appointment Adherence',
        contribution: profile.engagement.appointmentAdherence * 0.4,
      },
      {
        factor: 'Communication Responsiveness',
        contribution: profile.engagement.communicationResponsiveness * 0.3,
      },
      {
        factor: 'Portal Usage',
        contribution: (profile.engagement.portalUsage || 0) * 0.2,
      },
      {
        factor: 'Satisfaction Score',
        contribution: (profile.engagement.satisfactionScore || 0) / 5 * 0.1,
      },
    ];

    const score = factors.reduce((sum, f) => sum + f.contribution, 0);

    return {
      score,
      factors,
      trend: score > 0.7 ? 'improving' : score > 0.5 ? 'stable' : 'declining',
    };
  }

  /**
   * Predict patient churn
   */
  async predictChurn(
    tenantId: string,
    patientId: string
  ): Promise<{
    churnProbability: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    interventions: string[];
  }> {
    const profile = await this.getPatientProfile(tenantId, patientId);

    const factors: string[] = [];
    let probability = profile.behavioral.predictedChurn;

    if (profile.engagement.appointmentAdherence < 0.7) {
      factors.push('Low appointment adherence');
      probability += 0.15;
    }

    if (profile.engagement.communicationResponsiveness < 0.5) {
      factors.push('Poor communication responsiveness');
      probability += 0.10;
    }

    if (profile.clinical.lastVisit && 
        (Date.now() - profile.clinical.lastVisit.getTime()) > 120 * 86400000) {
      factors.push('No recent visits (>120 days)');
      probability += 0.20;
    }

    probability = Math.min(probability, 0.95);

    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (probability < 0.3) riskLevel = 'low';
    else if (probability < 0.5) riskLevel = 'medium';
    else if (probability < 0.7) riskLevel = 'high';
    else riskLevel = 'critical';

    const interventions = [
      'Proactive outreach via preferred contact method',
      'Offer convenient appointment times',
      'Provide value-add services or education',
      'Address any satisfaction concerns',
      'Personalized engagement campaign',
    ];

    return {
      churnProbability: probability,
      riskLevel,
      factors,
      interventions,
    };
  }
}

const patient360Service = new Patient360Service();

// API Routes
router.get('/profile/:patientId', authenticateToken, hipaaAuditLog, async (req: AuthRequest, res) => {
  try {
    const { patientId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await patient360Service.getPatientProfile(
      req.user.tenantId,
      patientId
    );

    res.json(profile);
  } catch (error: any) {
    console.error('[Patient360 Error]', error);
    res.status(500).json({ error: 'Failed to get patient profile', details: error.message });
  }
});

router.post('/summary/generate', authenticateToken, hipaaAuditLog, async (req: AuthRequest, res) => {
  try {
    const { patientId, timeframe } = req.body;

    if (!patientId) {
      res.status(400).json({ error: 'Missing required field: patientId' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const summary = await patient360Service.generateCareSummary(
      req.user.tenantId,
      patientId,
      timeframe ? {
        start: new Date(timeframe.start),
        end: new Date(timeframe.end),
      } : undefined
    );

    res.json(summary);
  } catch (error: any) {
    console.error('[Patient360 Error]', error);
    res.status(500).json({ error: 'Failed to generate summary', details: error.message });
  }
});

router.get('/engagement/:patientId', authenticateToken, hipaaAuditLog, async (req: AuthRequest, res) => {
  try {
    const { patientId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const engagement = await patient360Service.calculateEngagementScore(
      req.user.tenantId,
      patientId
    );

    res.json(engagement);
  } catch (error: any) {
    console.error('[Patient360 Error]', error);
    res.status(500).json({ error: 'Failed to calculate engagement', details: error.message });
  }
});

router.get('/churn/:patientId', authenticateToken, hipaaAuditLog, async (req: AuthRequest, res) => {
  try {
    const { patientId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const churn = await patient360Service.predictChurn(
      req.user.tenantId,
      patientId
    );

    res.json(churn);
  } catch (error: any) {
    console.error('[Patient360 Error]', error);
    res.status(500).json({ error: 'Failed to predict churn', details: error.message });
  }
});

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Patient360',
    version: '1.0.0',
    capabilities: [
      'unified_profile',
      'care_summary',
      'engagement_scoring',
      'churn_prediction',
    ],
  });
});

export default router;
