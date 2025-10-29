const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { multiTenantMiddleware, featureAccessMiddleware } = require('../middleware/multiTenant');
const ghlService = require('../services/ghlService');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');

// Apply middleware
router.use(auth);
router.use(multiTenantMiddleware());
router.use(featureAccessMiddleware('marketing'));

// Initialize GHL integration
router.post('/initialize', async (req, res) => {
  try {
    const { apiKey, locationId } = req.body;

    if (!apiKey || !locationId) {
      return res.status(400).json({ error: 'API key and location ID are required' });
    }

    // Initialize GHL client
    ghlService.initializeClient(req.clinicId, apiKey, locationId);

    // Update clinic integration settings
    await req.clinic.updateOne({
      'integrations.ghl.enabled': true,
      'integrations.ghl.apiKey': apiKey,
      'integrations.ghl.locationId': locationId,
      'integrations.ghl.lastSync': new Date()
    });

    logger.logIntegrationEvent('GHL', 'INTEGRATION_INITIALIZED', {
      clinicId: req.clinicId,
      locationId
    });

    res.json({ message: 'GHL integration initialized successfully' });
  } catch (error) {
    logger.error('Error initializing GHL integration:', error);
    res.status(500).json({ error: 'Failed to initialize GHL integration' });
  }
});

// Sync patients to GHL contacts
router.post('/sync-patients', async (req, res) => {
  try {
    const { patientIds } = req.body;

    if (!req.clinic.integrations.ghl.enabled) {
      return res.status(400).json({ error: 'GHL integration not enabled' });
    }

    const filter = { clinicId: req.clinicId, status: 'active' };
    if (patientIds && patientIds.length > 0) {
      filter._id = { $in: patientIds };
    }

    const patients = await Patient.find(filter);
    const syncResults = [];

    for (const patient of patients) {
      try {
        const personalInfo = patient.getDecryptedPersonalInfo();
        
        const contactData = {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          address: personalInfo.address,
          patientId: patient.patientId,
          riskScore: patient.riskScore?.overall || 0,
          primaryProvider: patient.primaryProvider,
          tags: ['patient', 'botlace_sync']
        };

        const ghlContact = await ghlService.createContact(req.clinicId, contactData);
        
        // Update patient with GHL contact ID
        patient.ghlContactId = ghlContact.id;
        await patient.save();

        syncResults.push({
          patientId: patient._id,
          ghlContactId: ghlContact.id,
          status: 'success'
        });

      } catch (error) {
        logger.error(`Error syncing patient ${patient._id} to GHL:`, error);
        syncResults.push({
          patientId: patient._id,
          status: 'error',
          error: error.message
        });
      }
    }

    res.json({
      message: 'Patient sync completed',
      results: syncResults,
      summary: {
        total: syncResults.length,
        successful: syncResults.filter(r => r.status === 'success').length,
        failed: syncResults.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    logger.error('Error syncing patients to GHL:', error);
    res.status(500).json({ error: 'Failed to sync patients to GHL' });
  }
});

// Get GHL contacts
router.get('/contacts', async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    if (!req.clinic.integrations.ghl.enabled) {
      return res.status(400).json({ error: 'GHL integration not enabled' });
    }

    const searchParams = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    if (search) {
      searchParams.query = search;
    }

    const contacts = await ghlService.searchContacts(req.clinicId, searchParams);

    res.json({
      contacts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: contacts.length
      }
    });

  } catch (error) {
    logger.error('Error fetching GHL contacts:', error);
    res.status(500).json({ error: 'Failed to fetch GHL contacts' });
  }
});

// Create GHL opportunity
router.post('/opportunities', async (req, res) => {
  try {
    const { patientId, title, value, appointmentType, urgency } = req.body;

    if (!req.clinic.integrations.ghl.enabled) {
      return res.status(400).json({ error: 'GHL integration not enabled' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient || !patient.ghlContactId) {
      return res.status(404).json({ error: 'Patient not found or not synced to GHL' });
    }

    const opportunityData = {
      title: title || `${appointmentType} - ${patient.fullName}`,
      ghlContactId: patient.ghlContactId,
      value: value || 200, // Default appointment value
      appointmentType,
      urgency,
      estimatedRevenue: value
    };

    const opportunity = await ghlService.createOpportunity(req.clinicId, opportunityData);

    res.json({
      opportunity,
      message: 'Opportunity created successfully'
    });

  } catch (error) {
    logger.error('Error creating GHL opportunity:', error);
    res.status(500).json({ error: 'Failed to create GHL opportunity' });
  }
});

// AI-powered lead scoring
router.get('/lead-scoring', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    if (!req.clinic.integrations.ghl.enabled) {
      return res.status(400).json({ error: 'GHL integration not enabled' });
    }

    // Get GHL contacts
    const contacts = await ghlService.searchContacts(req.clinicId, { limit: parseInt(limit) });

    // Score leads using AI
    const scoredLeads = await ghlService.scoreLeads(req.clinicId, contacts);

    res.json({
      leads: scoredLeads,
      summary: {
        total: scoredLeads.length,
        highScore: scoredLeads.filter(l => l.leadScore >= 80).length,
        mediumScore: scoredLeads.filter(l => l.leadScore >= 60 && l.leadScore < 80).length,
        lowScore: scoredLeads.filter(l => l.leadScore < 60).length
      }
    });

  } catch (error) {
    logger.error('Error scoring leads:', error);
    res.status(500).json({ error: 'Failed to score leads' });
  }
});

// Generate AI campaign content
router.post('/generate-campaign', async (req, res) => {
  try {
    const { campaignType, targetAudience, objectives } = req.body;

    if (!req.clinic.integrations.ghl.enabled) {
      return res.status(400).json({ error: 'GHL integration not enabled' });
    }

    const content = await ghlService.generateCampaignContent(
      req.clinicId,
      campaignType,
      {
        ...targetAudience,
        objectives
      }
    );

    res.json({
      content,
      campaignType,
      targetAudience,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error generating campaign content:', error);
    res.status(500).json({ error: 'Failed to generate campaign content' });
  }
});

// Get campaign analytics
router.get('/campaigns/:campaignId/analytics', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { startDate, endDate } = req.query;

    if (!req.clinic.integrations.ghl.enabled) {
      return res.status(400).json({ error: 'GHL integration not enabled' });
    }

    const dateRange = {
      start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: endDate || new Date().toISOString()
    };

    const analytics = await ghlService.getCampaignAnalytics(
      req.clinicId,
      campaignId,
      dateRange
    );

    res.json(analytics);

  } catch (error) {
    logger.error('Error fetching campaign analytics:', error);
    res.status(500).json({ error: 'Failed to fetch campaign analytics' });
  }
});

// Patient journey mapping
router.get('/patient-journey/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!req.clinic.integrations.ghl.enabled) {
      return res.status(400).json({ error: 'GHL integration not enabled' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient || !patient.ghlContactId) {
      return res.status(404).json({ error: 'Patient not found or not synced to GHL' });
    }

    const journey = await ghlService.mapPatientJourney(req.clinicId, patient.ghlContactId);

    res.json({
      patient: {
        id: patient._id,
        name: patient.fullName,
        ghlContactId: patient.ghlContactId
      },
      journey
    });

  } catch (error) {
    logger.error('Error mapping patient journey:', error);
    res.status(500).json({ error: 'Failed to map patient journey' });
  }
});

// Create automated workflow
router.post('/workflows', async (req, res) => {
  try {
    const { name, trigger, actions, conditions } = req.body;

    if (!req.clinic.integrations.ghl.enabled) {
      return res.status(400).json({ error: 'GHL integration not enabled' });
    }

    const workflowData = {
      name,
      trigger,
      actions,
      conditions
    };

    const workflow = await ghlService.createAutomatedWorkflow(req.clinicId, workflowData);

    res.json({
      workflow,
      message: 'Automated workflow created successfully'
    });

  } catch (error) {
    logger.error('Error creating automated workflow:', error);
    res.status(500).json({ error: 'Failed to create automated workflow' });
  }
});

// Webhook endpoint for GHL events
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    const clinicId = req.headers['x-clinic-id']; // Clinic ID should be passed in headers

    if (!clinicId) {
      return res.status(400).json({ error: 'Clinic ID required in headers' });
    }

    const result = await ghlService.handleWebhook(clinicId, webhookData);

    res.json(result);

  } catch (error) {
    logger.error('Error handling GHL webhook:', error);
    res.status(500).json({ error: 'Failed to handle webhook' });
  }
});

// Get integration status
router.get('/status', async (req, res) => {
  try {
    const integration = req.clinic.integrations.ghl;

    const status = {
      enabled: integration.enabled,
      locationId: integration.locationId,
      lastSync: integration.lastSync,
      isConnected: false,
      syncedPatients: 0,
      totalContacts: 0
    };

    if (integration.enabled) {
      try {
        // Test connection by fetching a small number of contacts
        const testContacts = await ghlService.searchContacts(req.clinicId, { limit: 1 });
        status.isConnected = true;
        
        // Get sync statistics
        const syncedPatients = await Patient.countDocuments({
          clinicId: req.clinicId,
          ghlContactId: { $exists: true, $ne: null }
        });
        status.syncedPatients = syncedPatients;

        // Get total contacts (would need to implement in GHL service)
        status.totalContacts = testContacts.length; // Simplified

      } catch (error) {
        logger.warn('GHL connection test failed:', error);
        status.isConnected = false;
      }
    }

    res.json(status);

  } catch (error) {
    logger.error('Error getting GHL integration status:', error);
    res.status(500).json({ error: 'Failed to get integration status' });
  }
});

// Disconnect GHL integration
router.post('/disconnect', async (req, res) => {
  try {
    // Update clinic integration settings
    await req.clinic.updateOne({
      'integrations.ghl.enabled': false,
      'integrations.ghl.apiKey': null,
      'integrations.ghl.locationId': null
    });

    logger.logIntegrationEvent('GHL', 'INTEGRATION_DISCONNECTED', {
      clinicId: req.clinicId
    });

    res.json({ message: 'GHL integration disconnected successfully' });

  } catch (error) {
    logger.error('Error disconnecting GHL integration:', error);
    res.status(500).json({ error: 'Failed to disconnect GHL integration' });
  }
});

module.exports = router;