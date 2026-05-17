// CommonJS formatı — Vercel ile en uyumlu
const Groq = require('groq-sdk');

// Vercel'in req.body'yi bozmasını engellemek veya ham veriyi yakalamak için yardımcı fonksiyon
async function getRequestBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  
  // Eğer req.body tamamen boş veya stream halindeyse:
  return new Promise((resolve) => {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(bodyStr)); } catch { resolve({}); }
    });
  });
}

module.exports = async function handler(req, res) {
  // CORS
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
    // ✅ Güvenli body parse
    const body = await getRequestBody(req);
    const { messages, system, max_tokens = 1500 } = body;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const messageList = [];
    if (system) messageList.push({ role: 'system', content: system });
    
    if (Array.isArray(messages)) {
      messageList.push(...messages);
    }

    if (messageList.length === 0 || (messageList.length === 1 && system)) {
      return res.status(400).json({ error: 'No user messages provided' });
    }

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