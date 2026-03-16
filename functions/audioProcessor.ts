import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const PROCESSING_DIR = path.resolve(__dirname, '../processing');
const WAV_PATH = path.join(PROCESSING_DIR, 'current.wav');

// Ensure processing/ folder exists
if (!fs.existsSync(PROCESSING_DIR)) {
  fs.mkdirSync(PROCESSING_DIR, { recursive: true });
}

/**
 * Converts an audio file on disk to 16kHz mono PCM WAV using ffmpeg.
 * The inputPath is already on disk (written by multer diskStorage),
 * so ffmpeg reads directly from the file — no stdin, no buffer issues.
 */
export function convertToWav(inputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,        // input file already on disk
      '-f', 'wav',            // output format
      '-ar', '16000',         // 16kHz sample rate
      '-ac', '1',             // mono
      '-acodec', 'pcm_s16le', // 16-bit PCM
      '-y',                   // overwrite output file without asking
      WAV_PATH,
    ], { stdio: ['ignore', 'ignore', 'pipe'] });

    const errChunks: Buffer[] = [];
    ffmpeg.stderr.on('data', (chunk: Buffer) => errChunks.push(chunk));

    ffmpeg.on('close', (code) => {
      const ffmpegLog = Buffer.concat(errChunks).toString();
      if (code !== 0) {
        console.error('[ffmpeg] stderr:', ffmpegLog);
        return reject(new Error(`ffmpeg exited with code ${code}: ${ffmpegLog}`));
      }
      // Print duration line from ffmpeg output for verification
      const durationLine = ffmpegLog.split('\n').find(l => l.includes('Duration:'));
      if (durationLine) console.log('[ffmpeg]', durationLine.trim());
      resolve(WAV_PATH);
    });

    ffmpeg.on('error', (err) => reject(new Error(`Failed to start ffmpeg: ${err.message}`)));
  });
}

