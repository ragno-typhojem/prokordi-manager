
const GROQ_CONFIG = {
  url:    'https://api.groq.com/openai/v1/chat/completions',
  model:  'llama-3.3-70b-versatile',
  keyEnv: 'GROQ_API_KEY',
};


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const provider = GROQ_CONFIG; // default
  const apiKey = process.env.GROQ_API_KEY;


  // Anthropic formatını → OpenAI formatına dönüştür
  const { system, messages, max_tokens } = req.body;

  const openaiMessages = [];
  if (system) openaiMessages.push({ role: 'system', content: system });
  if (messages) openaiMessages.push(...messages);

  try {
    const upstream = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       provider.model,
        messages:    openaiMessages,
        max_tokens:  max_tokens || 1000,
        temperature: 0.3,   // Düşük sıcaklık → tutarlı JSON
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error('[/api/chat] Provider error:', data);
      return res.status(upstream.status).json({ error: data?.error?.message || 'Provider hatası.' });
    }

    // OpenAI → Anthropic format dönüşümü (frontend değişmeden çalışır)
    const text = data.choices?.[0]?.message?.content || '{"message":"Boş yanıt.","actions":[]}';
    return res.status(200).json({
      content: [{ type: 'text', text }]
    });

  } catch (err) {
    console.error('[/api/chat] Fetch error:', err);
    return res.status(502).json({ error: 'Upstream bağlantı hatası: ' + err.message });
  }
}
