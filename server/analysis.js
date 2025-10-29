const lexicon = require('./lexicon');

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^a-z0-9\s\-']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  const normalized = normalizeText(text);
  return normalized.split(' ').filter(Boolean);
}

function countMatches(text, wordsOrPhrases) {
  const normalized = normalizeText(text);
  let count = 0;
  for (const phrase of wordsOrPhrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)${escaped}(?=$|\\s)`, 'g');
    const matches = normalized.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }
function clamp100(x) { return Math.max(0, Math.min(100, x)); }

function analyzeText(text, options = {}) {
  const tokens = tokenize(text);
  const totalTokens = tokens.length || 1;

  // Sentiment
  const posCount = countMatches(text, lexicon.sentiment.positive);
  const negCount = countMatches(text, lexicon.sentiment.negative);
  const sentimentTotal = posCount + negCount || 1;
  const posNorm = posCount / sentimentTotal;
  const negNorm = negCount / sentimentTotal;
  const sentimentScore = clamp01(0.5 + (posNorm - negNorm)); // ~0..1 (centered)

  // Emotions
  const categoryScores = {};
  let totalEmotionMatches = 0;
  for (const [cat, words] of Object.entries(lexicon.categories)) {
    const matches = countMatches(text, [...words, ...lexicon.multiword]);
    totalEmotionMatches += matches;
    // Normalize to 0..1 relative to total tokens; scale lightly
    categoryScores[cat] = clamp01(matches / Math.sqrt(totalTokens));
  }

  const anxiety = categoryScores.anxiety || 0;
  const distrust = categoryScores.distrust || 0;
  const confusion = categoryScores.confusion || 0;
  const curiosity = categoryScores.curiosity || 0;
  const empowerment = categoryScores.empowerment || 0;
  const trust = categoryScores.trust || 0;

  // Trust score heuristic (0..100)
  const rawTrust = 50
    + 35 * (posNorm - negNorm)
    + 15 * empowerment
    + 10 * curiosity
    + 10 * trust
    - 25 * anxiety
    - 20 * distrust
    - 10 * confusion;
  const trustScore = clamp100(Math.round(rawTrust));

  // ERI (Emotional Resonance Index) heuristic 0..100
  const positiveBlend = curiosity + empowerment + trust + posNorm;
  const negativeBlend = anxiety + distrust + confusion + negNorm + 1e-6;
  const eri = clamp100(Math.round(100 * positiveBlend / (positiveBlend + negativeBlend)));

  // ELS (Emotional Loyalty Score) rough proxy
  const els = clamp100(Math.round(0.6 * trustScore + 40 * trust));

  // Comfort Duration proxy is domain-dependent; here estimate from low negativity
  const comfortDurationIndex = clamp100(Math.round(100 * (1 - Math.min(1, (anxiety + distrust + confusion) / 3))));

  // Tiering and recommendations
  let aiIntensity = 'assistive_ai';
  let transparencyLevel = 'medium';
  let tier = 'Cautious';
  if (trustScore < 60) {
    aiIntensity = 'human_first';
    transparencyLevel = 'high';
    tier = 'Skeptical/Confused';
  } else if (trustScore >= 80) {
    aiIntensity = 'personalized_ai';
    transparencyLevel = 'medium';
    tier = 'Trusting';
  }

  const dominantNegative = [
    { key: 'anxiety', v: anxiety },
    { key: 'distrust', v: distrust },
    { key: 'confusion', v: confusion }
  ].sort((a, b) => b.v - a.v)[0].key;

  const validationStatement = (() => {
    switch (dominantNegative) {
      case 'anxiety':
        return "It\'s completely reasonable to feel cautious with AI. You\'re in control at every step.";
      case 'distrust':
        return "Your privacy and autonomy come first. Here\'s exactly how your data is handled.";
      case 'confusion':
        return "No jargon. We\'ll explain things simply and only when you ask.";
      default:
        return "We\'re here to support your pace and preferences.";
    }
  })();

  const explainabilitySnippet = "This recommendation was generated using patterns in your recent feedback and behavior. You can view, edit, or delete the inputs used.";

  const recommendation = (() => {
    if (trustScore < 60) return 'Use human-first messaging with transparent opt-outs and a clear safety explainer.';
    if (trustScore < 80) return 'Offer assistive AI with easy controls and short explanations-on-demand.';
    return 'Lean into personalized AI experiences with co-creation prompts and proactive help.';
  })();

  const now = Date.now();
  const result = {
    textPreview: (text || '').slice(0, 300),
    tokens: totalTokens,
    sentiment: {
      positiveMatches: posCount,
      negativeMatches: negCount,
      positivity: Number(posNorm.toFixed(3))
    },
    emotions: {
      anxiety: Number(anxiety.toFixed(3)),
      distrust: Number(distrust.toFixed(3)),
      confusion: Number(confusion.toFixed(3)),
      curiosity: Number(curiosity.toFixed(3)),
      empowerment: Number(empowerment.toFixed(3)),
      trust: Number(trust.toFixed(3))
    },
    metrics: {
      trustScore,
      emotionalResonanceIndex: eri,
      emotionalLoyaltyScore: els,
      comfortDurationIndex
    },
    strategy: {
      tier,
      aiIntensity,
      transparencyLevel,
      recommendation
    },
    coaching: {
      validationStatement,
      explainabilitySnippet
    },
    meta: {
      analyzedAt: now
    }
  };

  // Add trust velocity if previous is provided
  if (options.prevTrustScore !== undefined && options.prevTrustScore !== null) {
    result.metrics.trustVelocity = Number((trustScore - Number(options.prevTrustScore)).toFixed(2));
  }

  return result;
}

module.exports = { analyzeText };
