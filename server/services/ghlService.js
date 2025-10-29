const axios = require('axios');
const logger = require('../utils/logger');
const aiEngine = require('./aiEngine');

class GoHighLevelService {
  constructor() {
    this.baseURL = 'https://rest.gohighlevel.com/v1';
    this.clients = new Map(); // Store client instances per clinic
  }

  // Initialize GHL client for a specific clinic
  initializeClient(clinicId, apiKey, locationId) {
    const client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Add request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        logger.logIntegrationEvent('GHL', 'REQUEST', {
          clinicId,
          method: config.method.toUpperCase(),
          url: config.url,
          timestamp: new Date().toISOString()
        });
        return config;
      },
      (error) => {
        logger.error('GHL request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    client.interceptors.response.use(
      (response) => {
        logger.logIntegrationEvent('GHL', 'RESPONSE', {
          clinicId,
          status: response.status,
          timestamp: new Date().toISOString()
        });
        return response;
      },
      (error) => {
        logger.error('GHL response error:', error);
        return Promise.reject(error);
      }
    );

    this.clients.set(clinicId, { client, locationId, apiKey });
    return client;
  }

  getClient(clinicId) {
    const clientData = this.clients.get(clinicId);
    if (!clientData) {
      throw new Error(`GHL client not initialized for clinic ${clinicId}`);
    }
    return clientData;
  }

  // Contact Management
  async createContact(clinicId, contactData) {
    try {
      const { client, locationId } = this.getClient(clinicId);
      
      const ghlContact = {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        address1: contactData.address?.line,
        city: contactData.address?.city,
        state: contactData.address?.state,
        postalCode: contactData.address?.postalCode,
        country: contactData.address?.country,
        source: 'Botlace AI',
        tags: contactData.tags || ['patient'],
        customFields: {
          patientId: contactData.patientId,
          lastAppointment: contactData.lastAppointment,
          riskScore: contactData.riskScore,
          primaryProvider: contactData.primaryProvider
        }
      };

      const response = await client.post(`/contacts/`, ghlContact);
      
      logger.logIntegrationEvent('GHL', 'CONTACT_CREATED', {
        clinicId,
        contactId: response.data.contact.id,
        patientId: contactData.patientId
      });

      return response.data.contact;
    } catch (error) {
      logger.error('Error creating GHL contact:', error);
      throw error;
    }
  }

  async updateContact(clinicId, ghlContactId, updateData) {
    try {
      const { client } = this.getClient(clinicId);
      
      const response = await client.put(`/contacts/${ghlContactId}`, updateData);
      
      logger.logIntegrationEvent('GHL', 'CONTACT_UPDATED', {
        clinicId,
        contactId: ghlContactId
      });

      return response.data.contact;
    } catch (error) {
      logger.error('Error updating GHL contact:', error);
      throw error;
    }
  }

  async getContact(clinicId, ghlContactId) {
    try {
      const { client } = this.getClient(clinicId);
      const response = await client.get(`/contacts/${ghlContactId}`);
      return response.data.contact;
    } catch (error) {
      logger.error('Error fetching GHL contact:', error);
      throw error;
    }
  }

  async searchContacts(clinicId, searchParams) {
    try {
      const { client } = this.getClient(clinicId);
      const response = await client.get('/contacts/', { params: searchParams });
      return response.data.contacts;
    } catch (error) {
      logger.error('Error searching GHL contacts:', error);
      throw error;
    }
  }

  // Opportunity Management
  async createOpportunity(clinicId, opportunityData) {
    try {
      const { client } = this.getClient(clinicId);
      
      const ghlOpportunity = {
        title: opportunityData.title,
        status: opportunityData.status || 'open',
        contactId: opportunityData.ghlContactId,
        monetaryValue: opportunityData.value,
        pipelineId: opportunityData.pipelineId,
        stageId: opportunityData.stageId,
        source: 'Botlace AI',
        customFields: {
          appointmentType: opportunityData.appointmentType,
          urgency: opportunityData.urgency,
          estimatedRevenue: opportunityData.estimatedRevenue
        }
      };

      const response = await client.post('/opportunities/', ghlOpportunity);
      
      logger.logIntegrationEvent('GHL', 'OPPORTUNITY_CREATED', {
        clinicId,
        opportunityId: response.data.opportunity.id,
        contactId: opportunityData.ghlContactId
      });

      return response.data.opportunity;
    } catch (error) {
      logger.error('Error creating GHL opportunity:', error);
      throw error;
    }
  }

  // Campaign Management
  async createCampaign(clinicId, campaignData) {
    try {
      const { client } = this.getClient(clinicId);
      
      const response = await client.post('/campaigns/', campaignData);
      
      logger.logIntegrationEvent('GHL', 'CAMPAIGN_CREATED', {
        clinicId,
        campaignId: response.data.campaign.id
      });

      return response.data.campaign;
    } catch (error) {
      logger.error('Error creating GHL campaign:', error);
      throw error;
    }
  }

  async getCampaigns(clinicId) {
    try {
      const { client } = this.getClient(clinicId);
      const response = await client.get('/campaigns/');
      return response.data.campaigns;
    } catch (error) {
      logger.error('Error fetching GHL campaigns:', error);
      throw error;
    }
  }

  // AI-Driven Lead Scoring
  async scoreLeads(clinicId, contacts) {
    try {
      const scoredLeads = [];

      for (const contact of contacts) {
        const leadData = {
          demographics: {
            age: this.calculateAge(contact.dateOfBirth),
            location: `${contact.city}, ${contact.state}`,
            source: contact.source
          },
          engagement: {
            emailOpens: contact.emailStats?.opens || 0,
            emailClicks: contact.emailStats?.clicks || 0,
            websiteVisits: contact.websiteVisits || 0,
            lastActivity: contact.lastActivity
          },
          healthProfile: {
            riskScore: contact.customFields?.riskScore || 0,
            conditions: contact.customFields?.conditions || [],
            lastAppointment: contact.customFields?.lastAppointment
          }
        };

        const aiScore = await aiEngine.predictPatientEngagement(leadData);
        
        const score = this.calculateCompositeLeadScore(contact, aiScore);
        
        scoredLeads.push({
          ...contact,
          leadScore: score,
          aiInsights: aiScore.insights,
          recommendedActions: this.getRecommendedActions(score, contact)
        });
      }

      return scoredLeads.sort((a, b) => b.leadScore - a.leadScore);
    } catch (error) {
      logger.error('Error scoring leads:', error);
      throw error;
    }
  }

  calculateCompositeLeadScore(contact, aiScore) {
    let score = 0;

    // Engagement score (0-30 points)
    const engagementScore = Math.min(30, (
      (contact.emailStats?.opens || 0) * 2 +
      (contact.emailStats?.clicks || 0) * 5 +
      (contact.websiteVisits || 0) * 3
    ));

    // Recency score (0-25 points)
    const daysSinceLastActivity = contact.lastActivity ? 
      Math.floor((Date.now() - new Date(contact.lastActivity)) / (1000 * 60 * 60 * 24)) : 365;
    const recencyScore = Math.max(0, 25 - (daysSinceLastActivity / 7));

    // Health risk score (0-25 points)
    const riskScore = Math.min(25, (contact.customFields?.riskScore || 0) / 4);

    // AI prediction score (0-20 points)
    const aiPredictionScore = aiScore.engagementProbability * 20;

    score = engagementScore + recencyScore + riskScore + aiPredictionScore;

    return Math.round(score);
  }

  getRecommendedActions(score, contact) {
    const actions = [];

    if (score >= 80) {
      actions.push('immediate_outreach', 'schedule_consultation', 'premium_service_offer');
    } else if (score >= 60) {
      actions.push('personalized_email', 'health_assessment_offer', 'follow_up_call');
    } else if (score >= 40) {
      actions.push('educational_content', 'newsletter_signup', 'health_tips');
    } else {
      actions.push('nurture_campaign', 'basic_health_content', 'quarterly_check_in');
    }

    // Add condition-specific actions
    if (contact.customFields?.riskScore > 70) {
      actions.push('urgent_health_screening', 'provider_consultation');
    }

    return actions;
  }

  // Automated Workflow Management
  async createAutomatedWorkflow(clinicId, workflowData) {
    try {
      const { client } = this.getClient(clinicId);
      
      const workflow = {
        name: workflowData.name,
        trigger: workflowData.trigger,
        actions: workflowData.actions,
        conditions: workflowData.conditions,
        isActive: true
      };

      const response = await client.post('/workflows/', workflow);
      
      logger.logIntegrationEvent('GHL', 'WORKFLOW_CREATED', {
        clinicId,
        workflowId: response.data.workflow.id
      });

      return response.data.workflow;
    } catch (error) {
      logger.error('Error creating GHL workflow:', error);
      throw error;
    }
  }

  // AI-Generated Campaign Content
  async generateCampaignContent(clinicId, campaignType, targetAudience) {
    try {
      const prompt = `
        Generate healthcare marketing campaign content for:
        Campaign Type: ${campaignType}
        Target Audience: ${JSON.stringify(targetAudience)}
        
        Include:
        1. Email subject lines (3 variations)
        2. Email body content (personalized)
        3. SMS message templates
        4. Social media posts
        5. Call-to-action suggestions
        
        Ensure HIPAA compliance and professional medical tone.
      `;

      const content = await aiEngine.generateMarketingContent(prompt);
      
      logger.logIntegrationEvent('GHL', 'AI_CONTENT_GENERATED', {
        clinicId,
        campaignType,
        contentLength: JSON.stringify(content).length
      });

      return content;
    } catch (error) {
      logger.error('Error generating campaign content:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  async getCampaignAnalytics(clinicId, campaignId, dateRange) {
    try {
      const { client } = this.getClient(clinicId);
      
      const params = {
        campaignId,
        startDate: dateRange.start,
        endDate: dateRange.end
      };

      const response = await client.get('/analytics/campaigns', { params });
      
      const analytics = response.data;
      
      // Enhance with AI insights
      const aiInsights = await this.generateCampaignInsights(analytics);
      
      return {
        ...analytics,
        aiInsights
      };
    } catch (error) {
      logger.error('Error fetching campaign analytics:', error);
      throw error;
    }
  }

  async generateCampaignInsights(analyticsData) {
    try {
      const insights = await aiEngine.analyzeCampaignPerformance(analyticsData);
      return insights;
    } catch (error) {
      logger.error('Error generating campaign insights:', error);
      return { insights: 'Unable to generate AI insights at this time' };
    }
  }

  // Patient Journey Mapping
  async mapPatientJourney(clinicId, contactId) {
    try {
      const { client } = this.getClient(clinicId);
      
      // Get contact history
      const contactHistory = await client.get(`/contacts/${contactId}/activities`);
      
      // Get opportunity history
      const opportunities = await client.get(`/opportunities?contactId=${contactId}`);
      
      // Get campaign interactions
      const campaigns = await client.get(`/contacts/${contactId}/campaigns`);
      
      const journeyData = {
        contact: contactHistory.data,
        opportunities: opportunities.data,
        campaigns: campaigns.data
      };

      // Use AI to analyze journey and predict next best actions
      const journeyAnalysis = await aiEngine.analyzePatientJourney(journeyData);
      
      return {
        timeline: this.buildJourneyTimeline(journeyData),
        insights: journeyAnalysis.insights,
        nextBestActions: journeyAnalysis.recommendations,
        conversionProbability: journeyAnalysis.conversionProbability
      };
    } catch (error) {
      logger.error('Error mapping patient journey:', error);
      throw error;
    }
  }

  buildJourneyTimeline(journeyData) {
    const events = [];
    
    // Add contact events
    journeyData.contact.activities?.forEach(activity => {
      events.push({
        type: 'activity',
        date: activity.createdAt,
        description: activity.description,
        source: 'contact'
      });
    });
    
    // Add opportunity events
    journeyData.opportunities?.forEach(opp => {
      events.push({
        type: 'opportunity',
        date: opp.createdAt,
        description: `Opportunity: ${opp.title}`,
        value: opp.monetaryValue,
        source: 'opportunity'
      });
    });
    
    // Add campaign events
    journeyData.campaigns?.forEach(campaign => {
      events.push({
        type: 'campaign',
        date: campaign.sentAt,
        description: `Campaign: ${campaign.name}`,
        opened: campaign.opened,
        clicked: campaign.clicked,
        source: 'campaign'
      });
    });
    
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // Webhook handling for real-time sync
  async handleWebhook(clinicId, webhookData) {
    try {
      const eventType = webhookData.type;
      const data = webhookData.data;

      logger.logIntegrationEvent('GHL', 'WEBHOOK_RECEIVED', {
        clinicId,
        eventType,
        timestamp: new Date().toISOString()
      });

      switch (eventType) {
        case 'contact.created':
          await this.syncContactToPatient(clinicId, data);
          break;
        case 'contact.updated':
          await this.updatePatientFromContact(clinicId, data);
          break;
        case 'opportunity.created':
          await this.createAppointmentFromOpportunity(clinicId, data);
          break;
        case 'campaign.sent':
          await this.trackCampaignEngagement(clinicId, data);
          break;
      }

      return { success: true };
    } catch (error) {
      logger.error('Error handling GHL webhook:', error);
      throw error;
    }
  }

  async syncContactToPatient(clinicId, contactData) {
    // Implementation would sync GHL contact to patient record
    logger.info('Syncing GHL contact to patient record', { clinicId, contactId: contactData.id });
  }

  async updatePatientFromContact(clinicId, contactData) {
    // Implementation would update patient record from GHL contact changes
    logger.info('Updating patient from GHL contact', { clinicId, contactId: contactData.id });
  }

  async createAppointmentFromOpportunity(clinicId, opportunityData) {
    // Implementation would create appointment from GHL opportunity
    logger.info('Creating appointment from GHL opportunity', { clinicId, opportunityId: opportunityData.id });
  }

  async trackCampaignEngagement(clinicId, campaignData) {
    // Implementation would track campaign engagement metrics
    logger.info('Tracking campaign engagement', { clinicId, campaignId: campaignData.id });
  }
}

module.exports = new GoHighLevelService();