# API Documentation

## EIME™ & BOTLACE Platform API Reference

---

## Table of Contents

1. [EIME™ Sentiment Engine API](#eime-sentiment-engine-api)
2. [BOTLACE Healthcare AI API](#botlace-healthcare-ai-api)
3. [GoHighLevel Integration API](#gohighlevel-integration-api)
4. [Authentication](#authentication)
5. [Rate Limits](#rate-limits)
6. [Error Handling](#error-handling)

---

## EIME™ Sentiment Engine API

### Base URL
```
https://api.eime.ai/v1
```

### Authentication
All requests require an API key in the header:
```
Authorization: Bearer YOUR_API_KEY
```

---

### Emotion Detection

#### Analyze Text
Detect emotional signals and calculate trust score from text input.

**Endpoint:** `POST /analyze`

**Request Body:**
```json
{
  "text": "I'm worried about using AI for my business...",
  "userId": "user_12345",
  "context": "customer_feedback"
}
```

**Response:**
```json
{
  "emotions": {
    "anxiety": {
      "detected": true,
      "matches": ["worried"],
      "intensity": 1
    },
    "trust": {
      "detected": false,
      "matches": [],
      "intensity": 0
    }
  },
  "trustScore": 62,
  "primaryEmotion": "anxiety",
  "recommendation": {
    "tone": "Reassuring and validating",
    "action": "Acknowledge concerns before presenting solutions",
    "message": "Show transparency and provide clear explanations",
    "example": "We understand AI can feel overwhelming. Let's start with what matters to you.",
    "aiIntensity": "medium"
  },
  "timestamp": "2025-10-29T10:30:00Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `401` - Unauthorized
- `429` - Rate limit exceeded

---

#### Generate User Profile
Create an emotional profile based on multiple interactions.

**Endpoint:** `POST /profile/generate`

**Request Body:**
```json
{
  "userId": "user_12345",
  "interactions": [
    "I'm concerned about privacy...",
    "This looks interesting, how does it work?",
    "The demo was really helpful, thanks!"
  ]
}
```

**Response:**
```json
{
  "userId": "user_12345",
  "averageTrustScore": "72.3",
  "trustVelocity": "+12.5",
  "dominantEmotions": [
    { "emotion": "curiosity", "count": 2 },
    { "emotion": "anxiety", "count": 1 }
  ],
  "totalInteractions": 3,
  "comfortLevel": "medium",
  "recommendedAIIntensity": "medium",
  "nextSteps": [
    "Gradually introduce AI features",
    "Provide 'Explain This' widgets",
    "Offer customization controls",
    "Share success stories"
  ]
}
```

---

#### Calculate Trust Metrics

**Endpoint:** `POST /metrics/trust`

**Request Body:**
```json
{
  "interactions": [
    { "text": "Great experience!", "timestamp": "2025-10-15T10:00:00Z" },
    { "text": "Very helpful support", "timestamp": "2025-10-20T14:30:00Z" }
  ]
}
```

**Response:**
```json
{
  "emotionalResonanceIndex": 87,
  "trustVelocity": "+15.2%",
  "comfortDuration": "8.5 min",
  "emotionalLoyaltyScore": 92
}
```

---

### Therapist Framework

#### Get Validation Response

**Endpoint:** `POST /therapist/validate`

**Request Body:**
```json
{
  "userConcern": "I don't understand how this AI works",
  "userProfile": {
    "trustScore": 55,
    "primaryEmotion": "confusion"
  }
}
```

**Response:**
```json
{
  "step1_validate": "When things feel unclear, it's frustrating. We get that.",
  "step2_acknowledge": "Your experience matters, and we take this seriously.",
  "step3_solution": {
    "tone": "Empathetic and simplifying",
    "action": "Break down complexity, offer guided support",
    "message": "Use plain language and visual aids"
  },
  "step4_empower": "You're in control of how much AI assistance you want."
}
```

---

### Emotional Trust Loop

#### Execute Trust Cycle

**Endpoint:** `POST /trustloop/cycle`

**Request Body:**
```json
{
  "userInput": "This feature is confusing",
  "userProfile": {
    "userId": "user_12345",
    "averageTrustScore": 65,
    "comfortLevel": "medium"
  }
}
```

**Response:**
```json
{
  "timestamp": "2025-10-29T10:30:00Z",
  "listen": {
    "trustScore": 58,
    "primaryEmotion": "frustration"
  },
  "validate": {
    "step1_validate": "When things feel unclear, it's frustrating. We get that."
  },
  "empower": {
    "customization": [
      { "option": "AI Suggestion Level", "current": "medium" }
    ],
    "controls": [
      "Pause AI recommendations",
      "Request human review"
    ]
  },
  "educate": {
    "explainer": "Here's how we're helping: Use plain language and visual aids",
    "protection": "Your data is encrypted, never sold, and you can delete it anytime."
  },
  "evolve": {
    "modelUpdated": true,
    "feedbackLoop": "Your interaction helps us serve you and others better"
  }
}
```

---

## BOTLACE Healthcare AI API

### Base URL
```
https://api.botlace.health/v1
```

### Authentication
```
Authorization: Bearer YOUR_API_KEY
X-Location-ID: YOUR_LOCATION_ID
```

---

### Clinical Operations

#### Generate Clinical Summary

**Endpoint:** `POST /clinical/summary`

**Request Body:**
```json
{
  "patientId": "patient_12345",
  "visitId": "visit_67890",
  "visitNotes": "Patient presents with...",
  "vitals": {
    "bp": "120/80",
    "hr": 72,
    "temp": 98.6
  }
}
```

**Response:**
```json
{
  "summary": "45-year-old patient with presenting complaint of...",
  "icdCodes": [
    { "code": "M54.5", "description": "Low back pain" }
  ],
  "treatmentPlan": [
    "Physical therapy referral",
    "NSAIDs as needed",
    "Follow-up in 2 weeks"
  ],
  "confidence": 0.94,
  "fhirCompliant": true
}
```

---

#### Predict Appointment No-Show

**Endpoint:** `POST /clinical/predict-noshow`

**Request Body:**
```json
{
  "appointmentId": "appt_12345",
  "patientHistory": {
    "previousNoShows": 1,
    "totalAppointments": 12,
    "lastVisitDays": 45
  }
}
```

**Response:**
```json
{
  "noShowProbability": 0.23,
  "risk": "MEDIUM",
  "riskFactors": [
    "1 previous no-show",
    "Appointment scheduled >2 weeks out"
  ],
  "recommendation": {
    "action": "Send reminder 48 hours and 24 hours before",
    "priority": "MEDIUM"
  }
}
```

---

### Patient Management

#### Get Patient360 Profile

**Endpoint:** `GET /patients/{patientId}/profile`

**Response:**
```json
{
  "patientId": "patient_12345",
  "demographics": {
    "name": "John Doe",
    "age": 45,
    "insurance": "Blue Cross"
  },
  "clinicalSummary": {
    "lastVisit": "2025-09-15",
    "activeConditions": ["Hypertension", "Type 2 Diabetes"],
    "medications": ["Lisinopril 10mg", "Metformin 500mg"]
  },
  "engagementMetrics": {
    "portalLogins": 12,
    "emailOpenRate": "78%",
    "appointmentAdherence": "92%"
  },
  "aiInsights": {
    "churnRisk": "LOW",
    "lifetimeValue": "$2,847",
    "healthRiskScore": 34
  }
}
```

---

### Marketing Operations (GHL Integration)

#### Score Lead with AI

**Endpoint:** `POST /marketing/leads/score`

**Request Body:**
```json
{
  "leadId": "lead_12345",
  "leadData": {
    "emailActivity": { "opensCount": 5, "clicksCount": 2 },
    "phoneActivity": { "answered": true },
    "formSubmissions": 1,
    "websiteVisits": 8
  }
}
```

**Response:**
```json
{
  "leadId": "lead_12345",
  "aiLeadScore": 78,
  "leadTier": "WARM",
  "recommendedAction": {
    "action": "SCHEDULE_CALL",
    "priority": "MEDIUM",
    "message": "Warm lead - schedule call within 24 hours",
    "automation": "Send personalized email with booking link"
  }
}
```

---

#### Predict Patient Churn

**Endpoint:** `POST /marketing/churn/predict`

**Request Body:**
```json
{
  "patientId": "patient_12345",
  "patientData": {
    "lastVisit": "2024-12-15",
    "emailEngagement": { "opensCount": 0 },
    "missedAppointments": 2,
    "lastFeedback": { "sentiment": "neutral" }
  }
}
```

**Response:**
```json
{
  "patientId": "patient_12345",
  "churnRisk": "HIGH",
  "churnProbability": "72%",
  "riskFactors": [
    "No visit in 6+ months",
    "Not engaging with emails",
    "2 missed appointments"
  ],
  "interventionRecommendation": {
    "urgency": "IMMEDIATE",
    "action": "Personal outreach from provider",
    "message": "Have provider call personally to check in",
    "automation": "Trigger high-priority task for patient coordinator"
  }
}
```

---

#### Optimize Campaign

**Endpoint:** `POST /marketing/campaigns/optimize`

**Request Body:**
```json
{
  "campaignName": "Welcome New Patients",
  "audience": "new_patients",
  "subject": "Welcome to Our Practice",
  "content": "We're excited to have you...",
  "hasPersonalization": true
}
```

**Response:**
```json
{
  "sendTime": "10:00 AM",
  "bestDays": ["Tuesday", "Wednesday", "Thursday"],
  "subject": {
    "original": "Welcome to Our Practice",
    "optimized": "Welcome to Our Practice - here for you",
    "variants": [
      "Welcome to Our Practice",
      "[Personalized] Welcome to Our Practice",
      "here for you: Welcome to Our Practice"
    ]
  },
  "aiOptimizations": {
    "emotionalTone": "welcoming_reassuring",
    "predictedOpenRate": "27%",
    "predictedConversionRate": "5.0%"
  }
}
```

---

### Revenue Operations

#### Detect Billing Anomaly

**Endpoint:** `POST /revenue/anomaly-detect`

**Request Body:**
```json
{
  "billingPeriod": "2025-10",
  "transactions": [
    { "code": "99213", "amount": 150, "date": "2025-10-15" },
    { "code": "99213", "amount": 45, "date": "2025-10-16" }
  ]
}
```

**Response:**
```json
{
  "anomaliesDetected": 1,
  "anomalies": [
    {
      "transactionId": "txn_67890",
      "issue": "Amount significantly below average for code 99213",
      "expected": "$150",
      "actual": "$45",
      "severity": "HIGH",
      "recommendation": "Review billing entry for accuracy"
    }
  ]
}
```

---

#### Forecast Revenue

**Endpoint:** `POST /revenue/forecast`

**Request Body:**
```json
{
  "historicalData": {
    "months": 12,
    "averageMonthlyRevenue": 185000
  },
  "factors": {
    "newProviders": 1,
    "marketingSpend": 5000
  }
}
```

**Response:**
```json
{
  "forecastPeriod": "next_quarter",
  "projectedRevenue": "$612,000",
  "confidence": 0.87,
  "breakdown": {
    "month1": "$195,000",
    "month2": "$203,000",
    "month3": "$214,000"
  },
  "growthRate": "+8.5%",
  "assumptions": [
    "New provider reaches 80% capacity by month 3",
    "Marketing ROI of 4.2x based on historical data"
  ]
}
```

---

## GoHighLevel Integration API

### GHL Connector Usage

#### Initialize Connection

```javascript
const GHLConnector = require('./integrations/ghl-connector');

const ghl = new GHLConnector(
  'YOUR_GHL_API_KEY',
  'YOUR_LOCATION_ID'
);

const result = await ghl.initialize();
console.log(result);
```

#### Get and Score Leads

```javascript
const leads = await ghl.getLeads({
  limit: 50,
  status: 'active'
});

// Each lead will include AI scoring
leads.forEach(lead => {
  console.log(`Lead: ${lead.name}`);
  console.log(`AI Score: ${lead.aiLeadScore}/100`);
  console.log(`Tier: ${lead.leadTier}`);
  console.log(`Action: ${lead.recommendedAction.action}`);
});
```

#### Create Optimized Campaign

```javascript
const campaign = await ghl.createCampaign({
  name: 'Patient Re-engagement',
  audience: 'existing_patients',
  subject: 'We Miss You',
  content: 'It has been a while since your last visit...',
  hasPersonalization: true,
  includesIncentive: true
});

console.log(campaign.aiOptimizations);
```

#### Predict Churn

```javascript
const patients = [
  { id: 'p1', lastVisit: '2024-06-15', emailEngagement: { opensCount: 0 } },
  { id: 'p2', lastVisit: '2025-09-20', emailEngagement: { opensCount: 12 } }
];

const churnPredictions = await ghl.predictPatientChurn(patients);

churnPredictions.forEach(prediction => {
  if (prediction.churnRisk === 'HIGH') {
    console.log(`ALERT: ${prediction.name} - ${prediction.churnProbability} churn risk`);
    console.log(`Action: ${prediction.interventionRecommendation.action}`);
  }
});
```

---

## Authentication

### API Key Management

1. **Obtain API Key**: Sign up at dashboard.eime.ai or dashboard.botlace.health
2. **Include in Headers**: All requests must include API key
3. **Key Rotation**: Rotate keys every 90 days for security
4. **Rate Limit Tier**: Determined by your subscription plan

### Example Headers

```
Authorization: Bearer sk_live_abc123xyz789
Content-Type: application/json
X-Location-ID: loc_12345 (BOTLACE only)
```

---

## Rate Limits

| Plan | Requests/Hour | Requests/Day |
|------|---------------|--------------|
| **Starter** | 1,000 | 10,000 |
| **Professional** | 10,000 | 100,000 |
| **Enterprise** | Unlimited | Unlimited |

### Rate Limit Headers

Every response includes:
```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9847
X-RateLimit-Reset: 1730203200
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Missing required field: text",
    "param": "text",
    "type": "validation_error"
  }
}
```

### Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `400` | Bad Request | Check request parameters |
| `401` | Unauthorized | Verify API key |
| `403` | Forbidden | Check permissions |
| `404` | Not Found | Verify endpoint URL |
| `429` | Rate Limit | Reduce request rate or upgrade plan |
| `500` | Server Error | Contact support |

---

## Webhooks

### EIME™ Webhooks

Subscribe to events:
- `analysis.completed` - Emotion analysis finished
- `trust.threshold` - Trust score crosses threshold
- `profile.updated` - User profile changed

### BOTLACE Webhooks

Subscribe to events:
- `patient.created` - New patient record
- `appointment.booked` - Appointment scheduled
- `churn.alert` - High churn risk detected
- `billing.anomaly` - Billing irregularity found

### Webhook Setup

```javascript
POST /webhooks/subscribe
{
  "event": "churn.alert",
  "url": "https://your-server.com/webhooks/churn",
  "secret": "your_webhook_secret"
}
```

---

## SDKs

### JavaScript/Node.js

```bash
npm install @eime/sdk @botlace/sdk
```

```javascript
const EIME = require('@eime/sdk');
const eime = new EIME('YOUR_API_KEY');

const analysis = await eime.analyze({
  text: 'Customer feedback here...'
});
```

### Python

```bash
pip install eime-sdk botlace-sdk
```

```python
from eime import Client
eime = Client('YOUR_API_KEY')

analysis = eime.analyze(text='Customer feedback here...')
print(analysis.trust_score)
```

---

## Support

- **Documentation**: https://docs.eime.ai | https://docs.botlace.health
- **API Status**: https://status.eime.ai | https://status.botlace.health
- **Support Email**: api@eime.ai | api@botlace.health
- **Community**: https://community.eime.ai

---

## Changelog

### v1.0.0 (2025-10-29)
- Initial release
- Emotion detection API
- Therapist framework
- GHL integration
- Patient churn prediction
- Revenue forecasting

---

© 2025 EIME™ & BOTLACE. All rights reserved.
