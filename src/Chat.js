/**
 * Vercel Serverless Function — /api/chat
 *
 * ✅ TAMAMEN ÜCRETSİZ — Kredi kartı gerekmez
 * Groq API: https://console.groq.com → API Keys → Create
 * Model: llama-3.3-70b-versatile (GPT-4 kalitesinde, 315 token/saniye)
 *
 * Vercel Dashboard → Project → Settings → Environment Variables:
 *   GROQ_API_KEY = gsk_...
 *
 * Groq Ücretsiz Limitler (2026):
 *   - 30 istek/dakika
 *   - 14.400 token/gün
 *   - Kredi kartı YOK, süre sınırı YOK
 *
 * --- Alternatif: Google Gemini (daha cömert: 1.500 istek/gün) ---
 * PROVIDER=gemini olarak set edip GEMINI_API_KEY ekleyebilirsiniz.
 */

const GROQ_CONFIG = {
  url:    'https://api.groq.com/openai/v1/chat/completions',
  model:  'llama-3.3-70b-versatile',
  keyEnv: 'GROQ_API_KEY',
};

const GEMINI_CONFIG = {
  // Gemini'nin OpenAI-uyumlu endpoint'i
  url:    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  model:  'gemini-2.5-flash-preview-04-17',
  keyEnv: 'GEMINI_API_KEY',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Provider seç: env PROVIDER=gemini ise Gemini, yoksa Groq (varsayılan)
  const provider = process.env.PROVIDER === 'gemini' ? GEMINI_CONFIG : GROQ_CONFIG;
  const apiKey   = process.env[provider.keyEnv];

  if (!apiKey) {
    return res.status(500).json({
      error: `${provider.keyEnv} env değişkeni Vercel'de tanımlı değil. Dashboard → Settings → Environment Variables.`
    });
  }

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
