import { generateAnalysis } from '../lib/ai';

describe('AI Module', () => {
  test('generateAnalysis should handle empty input', async () => {
    await expect(generateAnalysis('')).rejects.toThrow();
  });

  test('generateAnalysis should throw when no API key configured', async () => {
    const text = 'This is a test legal document.';
    await expect(generateAnalysis(text)).rejects.toThrow(/HUGGINGFACE_API_KEY|OPENAI_API_KEY/);
  });
});
