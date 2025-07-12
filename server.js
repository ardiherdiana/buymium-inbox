require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Simpan email masuk di memori sementara
if (!global.inboundEmails) global.inboundEmails = [];

// Endpoint untuk menerima email dari Mailgun (forward)
app.post('/api/inbound', express.urlencoded({ extended: true }), (req, res) => {
  console.log('Inbound email:', req.body);
  global.inboundEmails.push({
    id: req.body['Message-Id'] || req.body['message-id'] || Date.now().toString(),
    subject: req.body.subject,
    from: req.body.from,
    to: req.body.recipient,
    body: req.body['body-plain'] || req.body['stripped-html'] || '',
    timestamp: Date.now() / 1000
  });
  res.status(200).send('OK');
});

// Endpoint untuk fetch email dari memori
app.get('/api/emails/:prefix', (req, res) => {
  const { prefix } = req.params;
  const emailAddress = `${prefix}@${config.MAILGUN_DOMAIN}`;
  const emails = (global.inboundEmails || []).filter(e => e.to === emailAddress);
  res.json({ success: true, emails: emails.reverse() });
});

// API endpoint untuk mengambil detail email spesifik
app.get('/api/email/:messageId', (req, res) => {
  const { messageId } = req.params;
  console.log('Cari email dengan ID:', messageId);
  console.log('Semua ID email:', (global.inboundEmails || []).map(e => e.id));
  const email = (global.inboundEmails || []).find(e => e.id === messageId);
  if (email) {
    res.json({ success: true, email });
  } else {
    res.status(404).json({ success: false, error: 'Email tidak ditemukan' });
  }
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Domain: ${config.MAILGUN_DOMAIN}`);
}); 