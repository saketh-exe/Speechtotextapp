import express, { Request, Response } from 'express';
import cors from 'cors';
import "dotenv/config";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { TranscribeAudio } from './functions/speechToText';

const app = express();
app.use(cors());
app.use(express.json());

// Ensure processing dir exists before multer uses it
const PROCESSING_DIR = path.resolve('./processing');
if (!fs.existsSync(PROCESSING_DIR)) fs.mkdirSync(PROCESSING_DIR, { recursive: true });

// Stream upload directly to disk — avoids RAM buffer issues with large recordings
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, PROCESSING_DIR),
    filename: (_req, _file, cb) => cb(null, 'input.m4a'),
  }),
});
const PORT = process.env.PORT || 3000;

app.post(
  '/api/speech-to-text',
  upload.single('audio'),
  TranscribeAudio()
);

app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, transcriptions } = req.body;
  console.log('Received chat message:', message);
  console.log('Provided transcriptions count:', transcriptions?.length || 0);
  
  let contextString = "";
  if (transcriptions && transcriptions.length > 0) {
    contextString = transcriptions.map((item: any) => `Audio [${item.id}]: "${item.transcript}"`).join('\n');
  }

  const prompt = `You are a helpful AI assistant. Use the following collected transcripts from the user's audio recordings to answer their question. If the answer is not in the transcripts, use your general knowledge, but prioritize the transcripts if relevant. 

IMPORTANT RULE: If your answer references any of the specific audio recordings provided in the context, you MUST include a structured "References" section at the very end of your response, listing exactly which audio files you used.

Format it exactly like this at the end if you reference any recordings:
---
References:
- Audio [filename.m4a]
- Audio [anotherfile.wav]

Transcripts context:
${contextString}

User's question: ${message}`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-v3.2:cloud', // adjust this if you are using a different model like 'qwen', 'mistral', etc.
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();
    
    res.json({ success: true, message: data.response });
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
    res.status(500).json({ success: false, message: 'Failed to communicate with AI model.' });
  }
});

app.get('/', (req: Request, res: Response) => {
  console.log("running")
  res.send('The speech to text API is running!');
});

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});