const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { analyzeText } = require('./analysis');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/version', (_req, res) => res.json({ name: 'eime-data-listening-api', version: '0.1.0' }));

app.get('/analyze', (req, res) => {
  const text = String(req.query.text || '');
  const prevTrustScore = req.query.prevTrust ? Number(req.query.prevTrust) : undefined;
  const result = analyzeText(text, { prevTrustScore });
  res.json(result);
});

app.post('/analyze', (req, res) => {
  const { text = '', meta = {} } = req.body || {};
  const result = analyzeText(String(text), { prevTrustScore: meta.prevTrustScore });
  res.json(result);
});

const PORT = process.env.PORT || 4321;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`EIME Data Listening API running on :${PORT}`);
  });
}

module.exports = app;
