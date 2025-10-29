const state = {
  feelings: [],
  transparency: { explainDefault: false, dataUsageLog: false, privacyControls: false },
  intensity: 'human_first'
};

function setStep(idx) {
  const steps = document.querySelectorAll('.step');
  steps.forEach((s, i) => s.classList.toggle('active', i === idx-1));
  for (let i = 1; i <= 4; i++) document.getElementById(`panel-${i}`).classList.toggle('hidden', i !== idx);
}

function summaryHTML() {
  const list = [
    `Feelings: ${state.feelings.join(', ') || '—'}`,
    `Transparency: ${state.transparency.explainDefault ? 'Explain-by-default, ' : ''}${state.transparency.dataUsageLog ? 'Usage log, ' : ''}${state.transparency.privacyControls ? 'One-click controls' : ''}`.replace(/, $/, ''),
    `AI Intensity: ${state.intensity.replace('_', ' ')}`
  ];

  // Comfort score heuristic
  const negative = state.feelings.filter(f => ['anxious','skeptical','confused','cautious'].includes(f)).length;
  const positive = state.feelings.filter(f => ['curious','optimistic'].includes(f)).length;
  let comfort = 50 + 10*positive - 10*negative;
  if (state.transparency.explainDefault) comfort += 10;
  if (state.transparency.privacyControls) comfort += 10;
  comfort = Math.max(0, Math.min(100, Math.round(comfort)));

  return `
    <div><strong>Trust Comfort Level:</strong> ${comfort}</div>
    <ul>
      ${list.map(item => `<li>${item}</li>`).join('')}
    </ul>
  `;
}

function save() {
  localStorage.setItem('eime_prefs', JSON.stringify(state));
}

function bind() {
  // Step 1
  document.getElementById('to-2').addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll('#panel-1 input[type=checkbox]:checked')).map(i => i.value);
    state.feelings = selected;
    setStep(2);
  });

  // Step 2
  document.getElementById('back-1').addEventListener('click', () => setStep(1));
  document.getElementById('to-3').addEventListener('click', () => {
    state.transparency.explainDefault = document.getElementById('explainDefault').checked;
    state.transparency.dataUsageLog = document.getElementById('dataUsageLog').checked;
    state.transparency.privacyControls = document.getElementById('privacyControls').checked;
    setStep(3);
  });

  // Step 3
  document.getElementById('back-2').addEventListener('click', () => setStep(2));
  document.getElementById('to-4').addEventListener('click', () => {
    const sel = document.querySelector('input[name=intensity]:checked');
    state.intensity = sel ? sel.value : 'human_first';
    document.getElementById('summary').innerHTML = summaryHTML();
    setStep(4);
  });

  // Step 4
  document.getElementById('back-3').addEventListener('click', () => setStep(3));
  document.getElementById('save').addEventListener('click', () => {
    save();
    document.getElementById('panel-4').classList.add('hidden');
    document.getElementById('saved').classList.remove('hidden');
  });
}

setStep(1);
bind();
