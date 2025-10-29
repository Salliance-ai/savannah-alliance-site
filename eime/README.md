# EIME™ Platform
## Emotionally Intelligent Marketing Engine

> **Core Philosophy:** "Emotional Intelligence Beats Algorithms"

EIME™ is a Cyber-Psychological SaaS Framework for Building Trust in the Age of AI. Where others optimize clicks, EIME optimizes comfort. Where others automate marketing, EIME humanizes it.

---

## 🧠 Core Components

### Layer 1: Emotional Data Layer
- Sentiment analysis from text input
- Emotion detection (anxiety, trust, curiosity, confusion, etc.)
- Trust signal and anxiety marker detection
- Real-time emotional metrics aggregation

### Layer 2: AI-EI Translator
- Maps behavioral data → emotional needs
- Generates comprehensive user emotional profiles
- Determines Trust Paradox Level (1-4)
- Provides actionable recommendations

### Layer 3: Empathy Engine
- Calculates trust scores (0-100)
- Recommends tone, timing, and transparency
- Adapts AI intensity based on user comfort
- Generates validation statements

### Layer 4: Trust Dashboard
- Real-time emotional trust metrics
- Trust Paradox Model visualization
- Emotional Trust Loop analytics
- Brand-level insights

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd eime

# Install dependencies
npm install

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

The server will start on `http://localhost:3000`

---

## 📊 API Endpoints

### Emotional Data Layer
- `POST /api/analyze-sentiment` - Analyze sentiment from text
- `POST /api/analyze-emotion` - Detect emotions from text

### AI-EI Translator
- `POST /api/generate-emotional-profile` - Generate user emotional profile
- `POST /api/map-behavior-to-emotion` - Map behaviors to emotional needs

### Empathy Engine
- `POST /api/recommend-tone` - Get tone and messaging recommendations
- `GET /api/user-trust-score/:userId` - Get user trust score

### Trust Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/metrics` - Get detailed trust metrics
- `GET /api/dashboard/trust-loop` - Get Trust Loop analytics
- `GET /api/users/:userId/trust-paradox-level` - Get user's Trust Paradox Level

---

## 🧩 The Trust Paradox Model

### Level 1️⃣: Awareness (Skeptical)
- **User Emotion:** Skeptical
- **Marketer Action:** Validate feelings about AI
- **Tech Role:** Sentiment analysis
- **Trust Outcome:** Curiosity

### Level 2️⃣: Engagement (Confused)
- **User Emotion:** Confused
- **Marketer Action:** Explain simply & transparently
- **Tech Role:** Natural-language explainability
- **Trust Outcome:** Comfort

### Level 3️⃣: Empowerment (Cautious)
- **User Emotion:** Cautious
- **Marketer Action:** Provide control & customization
- **Tech Role:** Adaptive UX + opt-outs
- **Trust Outcome:** Confidence

### Level 4️⃣: Relationship (Trusting)
- **User Emotion:** Trusting
- **Marketer Action:** Collaborate with the user
- **Tech Role:** Co-creation & predictive empathy
- **Trust Outcome:** Loyalty

---

## 📈 Trust KPIs

### Traditional → Emotional Upgrade
- **Click-Through Rate (CTR)** → **Emotional Resonance Index (ERI)**
- **Conversion Rate** → **Trust Velocity** (Δ in user trust over time)
- **Engagement Time** → **Comfort Duration** (time before opt-out/drop)
- **Retention** → **Emotional Loyalty Score (ELS)**

---

## 🔄 The Emotional Trust Loop

1. **Listen** - Capture user emotion signals
2. **Validate** - Acknowledge user concerns
3. **Empower** - Give users control
4. **Educate** - Explain clearly
5. **Evolve** - Train empathy engine from feedback

---

## 🧠 Cyber Psychology Backbone

EIME™ is built on:
- **Cognitive Load Theory** - Simplify AI explanations to lower anxiety
- **Affective Trust Theory** - Trust = benevolence + competence
- **Parasocial Interaction Model** - Users personify brands that "talk human"
- **Attachment Theory in UX** - Consistency + transparency build emotional attachment

---

## 💡 Usage Examples

### Analyze Emotion from Text
```javascript
POST /api/analyze-emotion
{
  "text": "I'm not sure I trust AI recommendations",
  "source": "chat",
  "userId": "user123"
}
```

### Get User Emotional Profile
```javascript
POST /api/generate-emotional-profile
{
  "userId": "user123"
}
```

### Get Tone Recommendation
```javascript
POST /api/recommend-tone
{
  "userId": "user123",
  "context": "onboarding",
  "trustScore": 65
}
```

---

## 🛠 Development

The platform uses:
- **Backend:** Node.js + Express
- **Frontend:** Vanilla JavaScript + Modern CSS
- **Emotion Analysis:** Sentiment.js + Custom pattern matching
- **Architecture:** Layered microservices approach

---

## 📝 License

MIT License - Built for transparency and trust.

---

## 🎯 Positioning

**"EIME™ helps brands humanize their algorithms — turning data into dialogue and AI into empathy."**

### Differentiation
- 🩵 Where others optimize clicks, you optimize comfort
- 🧠 Where others automate marketing, you humanize it
- 🤝 Where others use AI to predict behavior, you use it to understand emotion

---

**Built with empathy. Powered by emotional intelligence.**
