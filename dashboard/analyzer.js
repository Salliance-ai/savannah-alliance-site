// Browser-side lightweight analyzer mirroring the server logic
const EIMEAnalyzer = (() => {
  const categories = {
    anxiety: ['anxious','anxiety','worried','worry','concerned','concern','nervous','unsure','hesitant','overwhelmed','unsafe','fear','afraid','stress','stressed','doubt','doubts'],
    distrust: ['skeptical','sceptical','scam','manipulative','manipulate','biased','bias','opaque','black box','blackbox','privacy','surveillance','tracking','unethical','untrustworthy','risky','deceptive','fake'],
    confusion: ['confused','confusing','unclear','don\'t understand','dont understand','complicated','complex','hard to follow','what does this mean','how does this work','lost'],
    curiosity: ['curious','interested','explore','learn','try','wonder','test','play','experiment','pilot','demo'],
    empowerment: ['control','customize','customise','choose','opt-out','opt out','optin','opt-in','transparency','explain','explanation','see','understand','safe','consent','preferences','settings','privacy controls'],
    trust: ['trust','trusted','confident','confidence','reliable','reliability','consistent','consistency','transparent','honest','integrity','credible','reassuring','reassure']
  };
  const sentiment = {
    positive: ['love','great','good','awesome','excellent','helpful','easy','clear','transparent','honest','safe','secure','reliable','confident','like','enjoy','useful','works','solid'],
    negative: ['hate','bad','terrible','awful','confusing','unclear','hard','difficult','slow','bug','broken','annoying','frustrating','dangerous','unsafe','scam','manipulative','creepy']
  };
  const multiword = ['black box','opt out','opt-in','opt in','don\'t understand','hard to follow','what does this mean','how does this work','privacy controls'];

  const normalizeText = (t) => (t || '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^a-z0-9\s\-']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const tokenize = (t) => normalizeText(t).split(' ').filter(Boolean);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const clamp100 = (x) => Math.max(0, Math.min(100, x));

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

  function analyze(text, opts = {}) {
    const tokens = tokenize(text);
    const totalTokens = tokens.length || 1;

    const posCount = countMatches(text, sentiment.positive);
    const negCount = countMatches(text, sentiment.negative);
    const sTotal = posCount + negCount || 1;
    const posNorm = posCount / sTotal;
    const negNorm = negCount / sTotal;

    const scoreByCat = {};
    for (const [cat, words] of Object.entries(categories)) {
      const matches = countMatches(text, [...words, ...multiword]);
      scoreByCat[cat] = clamp01(matches / Math.sqrt(totalTokens));
    }

    const anxiety = scoreByCat.anxiety || 0;
    const distrust = scoreByCat.distrust || 0;
    const confusion = scoreByCat.confusion || 0;
    const curiosity = scoreByCat.curiosity || 0;
    const empowerment = scoreByCat.empowerment || 0;
    const trust = scoreByCat.trust || 0;

    const rawTrust = 50 + 35 * (posNorm - negNorm) + 15 * empowerment + 10 * curiosity + 10 * trust - 25 * anxiety - 20 * distrust - 10 * confusion;
    const trustScore = clamp100(Math.round(rawTrust));

    const positiveBlend = curiosity + empowerment + trust + posNorm;
    const negativeBlend = anxiety + distrust + confusion + negNorm + 1e-6;
    const eri = clamp100(Math.round(100 * positiveBlend / (positiveBlend + negativeBlend)));
    const els = clamp100(Math.round(0.6 * trustScore + 40 * trust));
    const comfort = clamp100(Math.round(100 * (1 - Math.min(1, (anxiety + distrust + confusion) / 3))));

    let aiIntensity = 'assistive_ai';
    let transparencyLevel = 'medium';
    let tier = 'Cautious';
    if (trustScore < 60) { aiIntensity = 'human_first'; transparencyLevel = 'high'; tier = 'Skeptical/Confused'; }
    else if (trustScore >= 80) { aiIntensity = 'personalized_ai'; transparencyLevel = 'medium'; tier = 'Trusting'; }

    const dominantNegative = [
      { key: 'anxiety', v: anxiety },
      { key: 'distrust', v: distrust },
      { key: 'confusion', v: confusion }
    ].sort((a,b)=>b.v-a.v)[0].key;

    const validationStatement = (
      dominantNegative === 'anxiety' ? "It\'s completely reasonable to feel cautious with AI. You\'re in control." :
      dominantNegative === 'distrust' ? "Your privacy and autonomy come first. Here\'s exactly how your data is handled." :
      "No jargon. We\'ll explain things simply and only when you ask."
    );

    const explainabilitySnippet = "This recommendation was generated from your recent feedback patterns. You can view or edit the inputs used.";
    const recommendation = trustScore < 60 ? 'Use human-first messaging with transparent opt-outs and a clear safety explainer.' : trustScore < 80 ? 'Offer assistive AI with easy controls and short explanations-on-demand.' : 'Lean into personalized AI with co-creation prompts and proactive help.';

    return {
      tokens: totalTokens,
      emotions: { anxiety, distrust, confusion, curiosity, empowerment, trust },
      metrics: { trustScore, emotionalResonanceIndex: eri, emotionalLoyaltyScore: els, comfortDurationIndex: comfort },
      strategy: { tier, aiIntensity, transparencyLevel, recommendation },
      coaching: { validationStatement, explainabilitySnippet },
      sentiment: { positiveMatches: posCount, negativeMatches: negCount, positivity: Number(posNorm.toFixed(3)) }
    };
  }

  return { analyze };
})();
