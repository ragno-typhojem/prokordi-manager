// CommonJS formatı — Vercel ile en uyumlu
const Groq = require('groq-sdk');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ✅ Body parse — Vercel bazen string olarak geliyor
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body) body = {};

  const { messages, system, max_tokens = 1500 } = body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const messageList = [];
    if (system) messageList.push({ role: 'system', content: system });
    if (Array.isArray(messages)) messageList.push(...messages);

    if (messageList.length === 0) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messageList,
      max_tokens,
      temperature: 0.7
    });

    return res.status(200).json(completion.choices[0].message);

  } catch (error) {
    console.error('Groq Error:', error?.message || error);
    // ✅ Her zaman JSON dön — asla HTML değil
    return res.status(500).json({
      error: error?.message || 'Internal server error',
      type: error?.constructor?.name || 'Error'
    });
  }
};