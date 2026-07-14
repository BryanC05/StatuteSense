import fs from 'fs/promises';
import { generateAnalysis } from '../lib/ai.js';

async function loadDotEnv() {
  try {
    const data = await fs.readFile(new URL('../.env', import.meta.url), 'utf-8');
    for (const line of data.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      if (!key || rest.length === 0) continue;
      process.env[key.trim()] = rest.join('=').trim();
    }
  } catch (err) {
    console.error('Unable to load .env:', err.message);
  }
}

await loadDotEnv();

const prompt = `Summarize the following legal clause: The parties agree to keep all confidential information secret, with a duration of two years after termination.`;

try {
  const output = await generateAnalysis(prompt);
  console.log('=== HF Output ===');
  console.log(output);
} catch (error) {
  console.error('=== HF Error ===');
  console.error(error);
  process.exit(1);
}
