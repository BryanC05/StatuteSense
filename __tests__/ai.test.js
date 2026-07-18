import { generateAnalysis } from '../lib/ai';

describe('AI Module', () => {
  test('generateAnalysis should handle empty input', async () => {
    await expect(generateAnalysis('')).rejects.toThrow();
  });

  test('generateAnalysis should handle very long input', async () => {
    const longText = 'A'.repeat(10000);
    await expect(generateAnalysis(longText)).resolves.toBeDefined();
  }, 30000);
});
