async function init() {
  const trustEl = document.getElementById('metric-trust');
  const transpEl = document.getElementById('metric-transparency');
  const acceptEl = document.getElementById('metric-acceptance');
  const elsEl = document.getElementById('metric-els');

  // Load sample feedback and compute metrics
  const samples = await fetch('/data-samples/sample_feedback.json').then(r => r.json()).catch(() => []);

  const analyses = samples.map(s => ({
    id: s.id,
    timestamp: s.timestamp,
    channel: s.channel,
    result: EIMEAnalyzer.analyze(s.text)
  }));

  // Aggregate metrics
  const avg = (arr) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  const trustAvg = Math.round(avg(analyses.map(a => a.result.metrics.trustScore)));
  const elsAvg = Math.round(avg(analyses.map(a => a.result.metrics.emotionalLoyaltyScore)));
  const acceptance = Math.round(avg(analyses.map(a => 100 - Math.abs(70 - a.result.metrics.trustScore)))); // proxy
  const transparencyEff = Math.round(avg(analyses.map(a => 100 * (a.result.strategy.transparencyLevel === 'high' ? 1 : a.result.strategy.transparencyLevel === 'medium' ? 0.7 : 0.4))));

  trustEl.textContent = trustAvg;
  elsEl.textContent = elsAvg;
  acceptEl.textContent = acceptance;
  transpEl.textContent = transparencyEff;

  // Charts
  const ctxTrust = document.getElementById('chartTrust');
  const sorted = analyses.sort((a,b)=>a.timestamp-b.timestamp);
  const trustSeries = sorted.map(a => a.result.metrics.trustScore);
  const labels = sorted.map(a => new Date(a.timestamp).toLocaleDateString());

  new Chart(ctxTrust, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Trust Score', data: trustSeries,
        borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.15)', tension: 0.3, fill: true
      }]
    },
    options: { scales: { y: { min: 0, max: 100 } } }
  });

  const ctxEmo = document.getElementById('chartEmotions');
  const last = analyses[analyses.length - 1]?.result;
  const emo = last?.emotions || { anxiety:0, distrust:0, confusion:0, curiosity:0, empowerment:0, trust:0 };
  new Chart(ctxEmo, {
    type: 'bar',
    data: {
      labels: ['Anxiety','Distrust','Confusion','Curiosity','Empowerment','Trust'],
      datasets: [{
        label: 'Intensity', data: [emo.anxiety, emo.distrust, emo.confusion, emo.curiosity, emo.empowerment, emo.trust],
        backgroundColor: ['#ef4444','#f97316','#f59e0b','#22c55e','#3b82f6','#6366f1']
      }]
    },
    options: { scales: { y: { beginAtZero: true, max: 1 } } }
  });

  // Analyzer UI
  const input = document.getElementById('inputText');
  const btn = document.getElementById('btnAnalyze');
  const out = document.getElementById('analysisOutput');
  const coach = document.getElementById('coachOutput');
  const explainToggle = document.getElementById('toggleExplain');

  btn.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) return;

    // Try API first, fallback to local
    let data;
    try {
      const res = await fetch('http://localhost:4321/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) data = await res.json();
    } catch (_) {}

    if (!data) {
      data = EIMEAnalyzer.analyze(text);
    }

    out.classList.remove('hidden');
    out.innerHTML = `
      <div class="kv"><strong>Trust Score:</strong> ${data.metrics.trustScore}</div>
      <div class="kv"><strong>ERI:</strong> ${data.metrics.emotionalResonanceIndex}</div>
      <div class="kv"><strong>Comfort Duration:</strong> ${data.metrics.comfortDurationIndex}</div>
      <div class="kv"><strong>Strategy:</strong> ${data.strategy.tier} · ${data.strategy.aiIntensity.replace('_',' ')} · transparency: ${data.strategy.transparencyLevel}</div>
      <div class="kv"><strong>Recommendation:</strong> ${data.strategy.recommendation}</div>
      ${explainToggle.checked ? `<div class="kv explain"><strong>Explain:</strong> ${data.coaching.explainabilitySnippet}</div>` : ''}
    `;

    coach.classList.remove('hidden');
    coach.innerHTML = `
      <div class="kv"><strong>Validation Before Solution:</strong> ${data.coaching.validationStatement}</div>
      <div class="kv"><strong>Tone Suggestion:</strong> ${data.metrics.trustScore < 60 ? 'Reassuring and transparent' : data.metrics.trustScore < 80 ? 'Supportive and concise' : 'Collaborative and empowering'}</div>
    `;
  });
}

init();
