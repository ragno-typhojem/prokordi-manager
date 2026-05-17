import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3001;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json({ limit: '10mb' }));

// ✅ API route'ları ÖNCE tanımla — static'ten önce!
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system, max_tokens = 1500 } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    const messageList = [];
    if (system) messageList.push({ role: 'system', content: system });
    if (Array.isArray(messages)) messageList.push(...messages);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messageList,
      max_tokens,
      temperature: 0.7
    });

    // OpenAI/Groq formatı: { role, content } — content düz string
    res.json(completion.choices[0].message);

  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ✅ Static SONRA — API'yi override etmesin
app.use(express.static(path.join(__dirname, 'build')));

// React SPA fallback — API dışı tüm route'lar için
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server: http://localhost:${PORT}`);
});