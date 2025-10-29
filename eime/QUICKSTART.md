# 🚀 EIME Platform - Quick Start Guide

## Installation & Setup

```bash
# Install dependencies
npm install

# Run demo to populate sample data
npm run demo

# Start the server
npm start
```

Then open your browser to: **http://localhost:3000**

---

## 🧪 Testing the Platform

### 1. Test Emotion Analysis

In the dashboard, scroll to **"Emotion Analysis Tool"** and try these sample texts:

**Anxiety/Distrust:**
```
"I'm worried about AI using my data. I don't trust automated recommendations."
```

**Curiosity:**
```
"This looks interesting! How does the AI work? Can you explain it to me?"
```

**Trust:**
```
"This system is great! I really appreciate the transparency and control."
```

### 2. View User Profiles

In **"User Emotional Profiles"**, try these User IDs:
- `user1` - Skeptical/Cautious (Level 1-2)
- `user2` - Curious/Engaged (Level 2-3)
- `user3` - Anxious/Distrustful (Level 1)
- `user4` - Trusting/Loyal (Level 4)

### 3. Get Empathy Recommendations

In **"Empathy Engine Recommendations"**, try:
- User ID: `user1`, Context: `onboarding`
- User ID: `user4`, Context: `feature-announcement`

This will show how the Empathy Engine adapts recommendations based on trust level.

---

## 📊 Understanding the Dashboard

### Trust Overview Metrics

- **Emotional Trust Index** 🩵 - Overall psychological safety score
- **Transparency Effectiveness** 🧩 - How well users understand the AI
- **AI Acceptance** 🔁 - Acceptance rate over time
- **Emotional Resonance Index** 📊 - Emotional connection vs. traditional CTR

### Trust Paradox Model

See how your users distribute across the 4 trust levels:
1. **Awareness** (Skeptical) - Need validation
2. **Engagement** (Confused) - Need clarity
3. **Empowerment** (Cautious) - Need control
4. **Relationship** (Trusting) - Ready for collaboration

### Trust Loop

Monitor the 5-stage emotional trust cycle:
- Listen → Validate → Empower → Educate → Evolve

---

## 🔌 API Usage Examples

### Analyze Text Emotion

```bash
curl -X POST http://localhost:3000/api/analyze-emotion \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I'm not sure about this AI thing",
    "source": "chat",
    "userId": "test-user"
  }'
```

### Get User Profile

```bash
curl -X POST http://localhost:3000/api/generate-emotional-profile \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1"}'
```

### Get Tone Recommendation

```bash
curl -X POST http://localhost:3000/api/recommend-tone \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "context": "onboarding",
    "trustScore": 45
  }'
```

### Get Dashboard Overview

```bash
curl http://localhost:3000/api/dashboard/overview
```

---

## 🎯 Key Features Demonstrated

✅ **Emotional Data Layer** - Real-time sentiment & emotion detection
✅ **AI-EI Translator** - Behavioral patterns → emotional needs
✅ **Empathy Engine** - Trust-score based recommendations
✅ **Trust Dashboard** - Brand-level emotional insights
✅ **Trust Paradox Model** - 4-level user journey visualization
✅ **Emotional Trust Loop** - 5-stage trust-building cycle

---

## 💡 Next Steps

1. **Integrate Real Data** - Connect to your CRM/chat/marketing platforms
2. **Customize Emotion Patterns** - Add industry-specific emotion detection
3. **Build Integrations** - Connect to email, ad platforms, or CRMs
4. **Scale Architecture** - Add database, caching, and load balancing

---

## 🆘 Troubleshooting

**Server won't start?**
- Check if port 3000 is available
- Ensure all dependencies are installed: `npm install`

**No data showing?**
- Run the demo: `npm run demo` to populate sample data

**API errors?**
- Check browser console for detailed error messages
- Verify the server is running on port 3000

---

**Ready to humanize your AI? Let's build trust together! 🧠💙**
