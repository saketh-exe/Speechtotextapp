import { Request, Response } from 'express';
import { spawn } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { convertToWav } from './audioProcessor';

const DEBUG_DIR = path.resolve(__dirname, '../debug');
if (!fs.existsSync(DEBUG_DIR)) fs.mkdirSync(DEBUG_DIR, { recursive: true });

const WHISPER = "/home/sak/Desktop/whisper.cpp/build/bin/whisper-cli";
const MODEL = "/home/sak/Desktop/whisper.cpp/models/ggml-small-q8_0.bin";

function runWhisper(audioPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "-m", MODEL,
      "-f", audioPath,
      "-nt",
      "-t", os.cpus().length.toString()
    ];

    const whisper = spawn(WHISPER, args);

    let result = "";
    let error = "";

    whisper.stdout.on("data", (data) => {
      result += data.toString();
    });

    whisper.stderr.on("data", (data) => {
      error += data.toString();
    });

    whisper.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(error));
      } else {
        resolve(result);
      }
    });
  });
}

export function TranscribeAudio() {
  return async (req: Request & { file?: any }, res: Response) => {
    if (!req.file) {
      console.warn('[SERVER] Request received but no file attached');
      res.status(400).json({ error: 'No audio file received' });
      return;
    }

    const requestStart = Date.now();
    const sizeKB = (req.file.size / 1024).toFixed(1);
    console.log(`\n[1/3] RECEIVED  — ${req.file.path} (${sizeKB} KB)`);

    // Save a timestamped debug copy so we can inspect the raw upload
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const debugCopy = path.join(DEBUG_DIR, `recording-${timestamp}.m4a`);
    fs.copyFileSync(req.file.path, debugCopy);
    console.log(`      Debug copy: ${debugCopy}`);

    try {
      const convertStart = Date.now();
      console.log(`[2/3] CONVERTING — running ffmpeg on ${req.file.path}`);
      const wavPath = await convertToWav(req.file.path);
      const wavSize = (fs.statSync(wavPath).size / 1024).toFixed(1);
      const wavDurationSec = (fs.statSync(wavPath).size / (16000 * 2)).toFixed(1); // 16kHz 16-bit mono
      console.log(`      WAV: ${wavPath} (${wavSize} KB, ~${wavDurationSec}s)`);
      console.log(`      ffmpeg took ${((Date.now() - convertStart) / 1000).toFixed(1)}s`);

      const whisperStart = Date.now();
      console.log(`[3/3] TRANSCRIBING — running whisper on ${wavPath}`);
      const transcript = await runWhisper(wavPath);
      console.log(`      Whisper took ${((Date.now() - whisperStart) / 1000).toFixed(1)}s`);
      console.log(`      Transcript (${transcript.trim().length} chars): ${transcript.trim().slice(0, 120)}...`);
      console.log(`      Total pipeline: ${((Date.now() - requestStart) / 1000).toFixed(1)}s\n`);

      res.json({ transcript: transcript.trim() });
    } catch (err: any) {
      console.error(`[ERROR] Pipeline failed after ${((Date.now() - requestStart) / 1000).toFixed(1)}s:`, err.message);
      res.status(500).json({ error: err.message });
    }
  };
}
