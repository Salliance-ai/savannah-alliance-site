// EIME Platform Frontend Application
const API_BASE = window.location.origin;

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboard();
  setupNavigation();
});

// Load dashboard overview
async function loadDashboard() {
  try {
    // Load overview metrics
    const overviewRes = await fetch(`${API_BASE}/api/dashboard/overview`);
    const overview = await overviewRes.json();

    // Load detailed metrics
    const metricsRes = await fetch(`${API_BASE}/api/dashboard/metrics`);
    const metrics = await metricsRes.json();

    // Load trust loop analytics
    const loopRes = await fetch(`${API_BASE}/api/dashboard/trust-loop`);
    const loop = await loopRes.json();

    // Update UI with data
    updateDashboardMetrics(metrics);
    updateTrustParadox(metrics.breakdown.byTrustLevel);
    updateTrustLoop(loop);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError('Failed to load dashboard data. Make sure the server is running.');
  }
}

// Update dashboard metrics
function updateDashboardMetrics(metrics) {
  document.getElementById('emotional-trust-index').textContent = 
    `${metrics.emotionalTrustIndex || 0}`;
  
  document.getElementById('transparency-effectiveness').textContent = 
    `${Math.round(metrics.transparencyEffectiveness || 0)}%`;
  
  const latestAcceptance = metrics.aiAcceptanceOverTime?.[metrics.aiAcceptanceOverTime.length - 1];
  document.getElementById('ai-acceptance').textContent = 
    `${latestAcceptance?.value || 0}%`;
  
  document.getElementById('emotional-resonance').textContent = 
    `${metrics.emotionalResonanceIndex?.score || 0}`;
}

// Update Trust Paradox levels
function updateTrustParadox(byTrustLevel) {
  document.getElementById('level-1-stat').textContent = 
    `${byTrustLevel.level1_awareness || 0}%`;
  
  document.getElementById('level-2-stat').textContent = 
    `${byTrustLevel.level2_engagement || 0}%`;
  
  document.getElementById('level-3-stat').textContent = 
    `${byTrustLevel.level3_empowerment || 0}%`;
  
  document.getElementById('level-4-stat').textContent = 
    `${byTrustLevel.level4_relationship || 0}%`;
}

// Update Trust Loop status
function updateTrustLoop(loop) {
  const steps = ['listen', 'validate', 'empower', 'educate', 'evolve'];
  steps.forEach(step => {
    const element = document.getElementById(`${step}-status`);
    if (element && loop.loop[step]) {
      element.textContent = loop.loop[step].status || 'Active';
    }
  });
}

// Analyze emotion from text input
async function analyzeEmotion() {
  const input = document.getElementById('emotion-input');
  const text = input.value.trim();
  const resultsDiv = document.getElementById('emotion-results');

  if (!text) {
    resultsDiv.innerHTML = '<p style="color: var(--error-color);">Please enter text to analyze.</p>';
    return;
  }

  resultsDiv.innerHTML = '<p>Analyzing emotion...</p>';

  try {
    const response = await fetch(`${API_BASE}/api/analyze-emotion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        source: 'dashboard-input',
        userId: 'demo-user'
      })
    });

    const result = await response.json();

    // Also analyze sentiment
    const sentimentRes = await fetch(`${API_BASE}/api/analyze-sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        source: 'dashboard-input',
        userId: 'demo-user'
      })
    });

    const sentiment = await sentimentRes.json();

    displayEmotionResults(result, sentiment);
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    resultsDiv.innerHTML = '<p style="color: var(--error-color);">Error analyzing emotion. Please try again.</p>';
  }
}

// Display emotion analysis results
function displayEmotionResults(emotionResult, sentimentResult) {
  const resultsDiv = document.getElementById('emotion-results');
  
  let html = '<div class="result-card">';
  html += '<h4>Emotion Analysis</h4>';
  
  html += '<p><strong>Primary Emotion:</strong> <span class="value">' + 
    (emotionResult.primaryEmotion || 'neutral') + '</span></p>';
  
  html += '<p><strong>Sentiment Score:</strong> <span class="value">' + 
    (sentimentResult.sentiment || 0) + '</span></p>';
  
  if (emotionResult.emotions && emotionResult.emotions.length > 0) {
    html += '<p><strong>Detected Emotions:</strong></p>';
    html += '<div>';
    emotionResult.emotions.forEach(emotion => {
      html += `<span class="emotion-tag ${emotion}">${emotion}</span>`;
    });
    html += '</div>';
  }
  
  if (emotionResult.trustSignal) {
    html += '<p style="color: var(--success-color); margin-top: 12px;">✓ Trust signal detected</p>';
  }
  
  if (emotionResult.anxietyMarker) {
    html += '<p style="color: var(--warning-color); margin-top: 12px;">⚠ Anxiety marker detected</p>';
  }
  
  if (sentimentResult.recommendation) {
    html += '<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">';
    html += '<p><strong>Recommendation:</strong></p>';
    html += '<p>' + sentimentResult.recommendation.message + '</p>';
    html += '<p style="font-size: 12px; color: var(--text-secondary);">Priority: ' + 
      sentimentResult.recommendation.priority + '</p>';
    html += '</div>';
  }
  
  html += '</div>';
  
  resultsDiv.innerHTML = html;
}

// Load user emotional profile
async function loadUserProfile() {
  const userId = document.getElementById('user-id-input').value.trim();
  const profileDiv = document.getElementById('profile-display');

  if (!userId) {
    profileDiv.innerHTML = '<p style="color: var(--error-color);">Please enter a User ID.</p>';
    return;
  }

  profileDiv.innerHTML = '<p>Loading profile...</p>';

  try {
    const response = await fetch(`${API_BASE}/api/generate-emotional-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    const profile = await response.json();
    displayUserProfile(profile);
  } catch (error) {
    console.error('Error loading profile:', error);
    profileDiv.innerHTML = '<p style="color: var(--error-color);">Error loading profile. Please try again.</p>';
  }
}

// Display user emotional profile
function displayUserProfile(profile) {
  const profileDiv = document.getElementById('profile-display');
  
  let html = '<div class="result-card">';
  html += '<h4>Emotional Profile: ' + profile.userId + '</h4>';
  
  if (profile.profileLevel === 'insufficient-data') {
    html += '<p>' + profile.recommendations[0] + '</p>';
    html += '</div>';
    profileDiv.innerHTML = html;
    return;
  }
  
  html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">';
  
  html += '<div><p><strong>Primary Emotion:</strong></p><p class="value">' + 
    profile.primaryEmotion + '</p></div>';
  
  html += '<div><p><strong>Emotional State:</strong></p><p class="value">' + 
    profile.emotionalState + '</p></div>';
  
  html += '<div><p><strong>Trust Paradox Level:</strong></p><p class="value">' + 
    profile.trustParadoxLevel + '</p><p style="font-size: 12px;">' + 
    profile.trustLevelDescription + '</p></div>';
  
  html += '<div><p><strong>Emotional Stability:</strong></p><p class="value">' + 
    Math.round(profile.emotionalStability * 100) + '%</p></div>';
  
  html += '</div>';
  
  if (profile.emotionalNeeds && profile.emotionalNeeds.length > 0) {
    html += '<div style="margin-top: 20px;"><p><strong>Emotional Needs:</strong></p>';
    profile.emotionalNeeds.forEach(need => {
      html += `<span class="emotion-tag">${need}</span>`;
    });
    html += '</div>';
  }
  
  if (profile.recommendations && profile.recommendations.length > 0) {
    html += '<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">';
    html += '<p><strong>Recommendations:</strong></p><ul style="margin-left: 20px; margin-top: 8px;">';
    profile.recommendations.forEach(rec => {
      html += '<li style="margin-bottom: 8px; font-size: 14px;">' + rec + '</li>';
    });
    html += '</ul></div>';
  }
  
  html += '</div>';
  
  profileDiv.innerHTML = html;
}

// Get empathy engine recommendation
async function getRecommendation() {
  const userId = document.getElementById('recommend-user-id').value.trim();
  const context = document.getElementById('recommend-context').value.trim() || 'general';
  const recDiv = document.getElementById('recommendation-display');

  if (!userId) {
    recDiv.innerHTML = '<p style="color: var(--error-color);">Please enter a User ID.</p>';
    return;
  }

  recDiv.innerHTML = '<p>Generating recommendation...</p>';

  try {
    // First get trust score
    const trustRes = await fetch(`${API_BASE}/api/user-trust-score/${userId}`);
    const trustData = await trustRes.json();
    
    // Then get recommendation
    const response = await fetch(`${API_BASE}/api/recommend-tone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        context,
        trustScore: trustData.trustScore
      })
    });

    const recommendation = await response.json();
    displayRecommendation(recommendation);
  } catch (error) {
    console.error('Error getting recommendation:', error);
    recDiv.innerHTML = '<p style="color: var(--error-color);">Error generating recommendation. Please try again.</p>';
  }
}

// Display empathy engine recommendation
function displayRecommendation(rec) {
  const recDiv = document.getElementById('recommendation-display');
  
  let html = '<div class="result-card">';
  html += '<h4>Empathy Engine Recommendation</h4>';
  
  html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">';
  
  html += '<div><p><strong>Trust Score:</strong></p><p class="value" style="font-size: 32px;">' + 
    rec.trustScore + '</p><p style="font-size: 12px;">Trust Level: ' + rec.trustLevel + '</p></div>';
  
  html += '<div><p><strong>Context:</strong></p><p class="value">' + rec.context + '</p></div>';
  
  html += '<div><p><strong>Primary Emotion:</strong></p><p class="value">' + 
    rec.emotionalContext.primaryEmotion + '</p></div>';
  
  html += '<div><p><strong>Trust Paradox Level:</strong></p><p class="value">' + 
    rec.emotionalContext.trustParadoxLevel + '</p></div>';
  
  html += '</div>';
  
  html += '<div style="margin-top: 24px; padding: 20px; background: var(--bg-light); border-radius: 8px;">';
  html += '<h4 style="margin-bottom: 12px;">Recommended Approach</h4>';
  
  const recData = rec.recommendation;
  html += '<p><strong>Tone:</strong> <span class="value">' + recData.tone + '</span></p>';
  html += '<p><strong>Style:</strong> <span class="value">' + recData.style + '</span></p>';
  html += '<p><strong>AI Intensity:</strong> <span class="value">' + recData.aiIntensity + '</span></p>';
  
  html += '<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">';
  html += '<p><strong>Suggested Messaging:</strong></p>';
  html += '<p style="font-style: italic; margin-top: 8px; color: var(--text-secondary);">"' + 
    rec.suggestedMessaging + '"</p>';
  html += '</div>';
  
  if (recData.features && recData.features.length > 0) {
    html += '<div style="margin-top: 16px;"><p><strong>Features to Show:</strong></p>';
    recData.features.forEach(feature => {
      html += `<span class="emotion-tag">${feature}</span>`;
    });
    html += '</div>';
  }
  
  html += '</div></div>';
  
  recDiv.innerHTML = html;
}

// Setup navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const section = document.getElementById(targetId);
      
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Update active state
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--error-color);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}
