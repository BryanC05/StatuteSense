import { NextResponse } from "next/server";
import { generateAnalysis } from "../../../lib/ai";
import { extractJson } from "../../../lib/jsonExtract";

import { checkRateLimit } from "../../../lib/rateLimit";

export async function POST(request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;
  const { text1, text2, title1, title2 } = await request.json();

  if (!text1?.trim() || !text2?.trim()) {
    return NextResponse.json({ error: "Both documents are required." }, { status: 400 });
  }

  const prompt = `Compare the following two legal documents and identify all differences.

Document 1: ${title1 || "Document 1"}
${text1}

Document 2: ${title2 || "Document 2"}
${text2}

Identify:
1. Added clauses (in Doc 2 but not Doc 1)
2. Removed clauses (in Doc 1 but not Doc 2)
3. Modified clauses (similar but different wording/terms)
4. Material changes that could affect rights/obligations

Return JSON in this format:
{
  "summary": "Brief overall comparison summary",
  "added": [{"title": "...", "text": "...", "impact": "low|medium|high"}],
  "removed": [{"title": "...", "text": "...", "impact": "low|medium|high"}],
  "modified": [{"title": "...", "original": "...", "revised": "...", "impact": "low|medium|high"}]
}`;

  try {
    const output = await generateAnalysis(prompt);
    const result = extractJson(output);
    if (result) {
      return NextResponse.json(result);
    }

    return NextResponse.json({
      summary: output,
      added: [],
      removed: [],
      modified: [],
    });
  } catch (error) {
    console.error("Comparison error:", error);
    return NextResponse.json({ error: error.message || "Comparison failed." }, { status: 500 });
  }
}
