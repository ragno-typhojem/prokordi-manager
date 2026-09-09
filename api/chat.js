// api/chat.js — Vercel serverless. Groq, otomatik model zinciri + JSON modu.
// 70b emekli oldu; artık tek modele bağlı değiliz: biri düşerse sıradakine geçer.
const Groq = require('groq-sdk');

const MODELS = [
  'openai/gpt-oss-120b',                        // ana: güçlü akıl yürütme, JSON'a sadık
  'moonshotai/kimi-k2-instruct-0905',           // yedek 1: uzun bağlam, Türkçe iyi
  'meta-llama/llama-4-maverick-17b-128e-instruct', // yedek 2
  'llama-3.1-8b-instant',                       // son çare: hızlı
];

let groq;
const client = () => (groq ??= new Groq({ apiKey: process.env.GROQ_API_KEY, maxRetries: 1 }));

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY tanımlı değil' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Geçersiz JSON' }); }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Gövde bir nesne olmalı' });

  const { messages = [], system = '', max_tokens = 2000, json = true, model } = body;
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: 'Mesaj yok' });

  const list = system ? [{ role: 'system', content: system }, ...messages] : messages;
  const chain = model ? [model, ...MODELS.filter((m) => m !== model)] : MODELS;
  const errors = [];

  for (const m of chain) {
    try {
      const r = await client().chat.completions.create({
        model: m,
        messages: list,
        max_tokens: Number(max_tokens) || 2000,
        temperature: 0.2,
        top_p: 0.9,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      });
      return res.status(200).json({
        content: r.choices?.[0]?.message?.content ?? '',
        model: m,
        usage: r.usage,
      });
    } catch (e) {
      const status = e?.status || e?.response?.status;
      errors.push(`${m}: ${status || ''} ${e?.message || e}`.trim());
      // model kapandı / bulunamadı / kota → sıradakini dene; gerçek istek hatasında dur
      const retryable = status === 404 || status === 429 || status === 503 || status >= 500 ||
        /model|decommission|not found|deprecat/i.test(e?.message || '');
      if (!retryable) break;
    }
  }

  console.error('Groq chain failed:', errors);
  return res.status(502).json({ error: 'Tüm modeller başarısız', details: errors });
};
