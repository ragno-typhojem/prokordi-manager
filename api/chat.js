// CommonJS formatı — Vercel ile en uyumlu
const Groq = require('groq-sdk');

module.exports = async function handler(req, res) {
  // CORS Ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
  }

  try {
    // ✅ Vercel için en güvenli body okuma yöntemi
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a valid object' });
    }

    const { messages, system, max_tokens = 1500 } = body;

    const messageList = [];
    if (system) messageList.push({ role: 'system', content: system });
    
    if (Array.isArray(messages)) {
      messageList.push(...messages);
    }

    if (messageList.length === 0 || (messageList.length === 1 && system)) {
      return res.status(400).json({ error: 'No user messages provided' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messageList,
      max_tokens: Number(max_tokens),
      temperature: 0.7
    });

    return res.status(200).json(completion.choices[0].message);

  } catch (error) {
    console.error('Groq Error:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Internal server error',
      type: error?.constructor?.name || 'Error'
    });
  }
};