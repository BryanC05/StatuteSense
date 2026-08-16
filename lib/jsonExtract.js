function extractJson(text) {
  // Try direct parse first
  try { return JSON.parse(text); } catch {}
  // Try to find the last complete JSON object (most likely the intended one)
  const matches = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
  if (matches) {
    for (let i = matches.length - 1; i >= 0; i--) {
      try { return JSON.parse(matches[i]); } catch {}
    }
  }
  // Try to extract from markdown code blocks
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1].trim()); } catch {}
  }
  return null;
}

module.exports = { extractJson };
