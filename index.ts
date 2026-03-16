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

app.get('/', (req: Request, res: Response) => {
  console.log("running")
  res.send('The speech to text API is running!');
});

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});