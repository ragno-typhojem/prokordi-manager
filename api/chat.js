import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'build')));

// ─── CHAT ENDPOINT ──────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system, max_tokens = 1500 } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
    }

    const messageList = [];

    if (system) {
      messageList.push({ role: 'system', content: system });
    }

    if (Array.isArray(messages)) {
      messageList.push(...messages);
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messageList,
      max_tokens,
      temperature: 0.7
    });

    res.json(completion.choices[0].message);
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default app;