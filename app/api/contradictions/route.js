import { NextResponse } from "next/server";
import { generateAnalysis } from "../../../lib/ai";
import { extractJson } from "../../../lib/jsonExtract";

import { checkRateLimit } from "../../../lib/rateLimit";

export async function POST(request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;
  const { text, jurisdiction = "US Federal" } = await request.json();

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Document text is required." }, { status: 400 });
  }

  const prompt = `You are a top trial attorney scanning a contract under ${jurisdiction} law.
Find all internal contradictions, conflicting clauses, or mutually exclusive provisions within the document (e.g. term length vs perpetual survival, liability caps vs unlimited indemnity, conflicting governing laws, inconsistent notice periods).

Return valid JSON in this format:
{
  "hasContradictions": true,
  "summary": "Brief summary of contract internal conflicts",
  "contradictions": [
    {
      "objectionType": "Term Length Conflict | Liability Cap Conflict | Notice Period Discrepancy | Governing Law Clash",
      "clause1": "Quote or summary of first conflicting provision",
      "clause2": "Quote or summary of second conflicting provision",
      "explanation": "Detailed explanation of why these two provisions contradict each other under ${jurisdiction} law",
      "severity": "High | Medium | Low",
      "recommendation": "Proposed fix or harmonizing rewrite"
    }
  ]
}

Document Text:
${text}`;

  try {
    const output = await generateAnalysis(prompt);
    const result = extractJson(output);
    if (result) {
      return NextResponse.json(result);
    }

    return NextResponse.json({
      hasContradictions: false,
      summary: output,
      contradictions: []
    });
  } catch (error) {
    console.error("Contradiction detection error:", error);
    return NextResponse.json({ error: error.message || "Contradiction check failed." }, { status: 500 });
  }
}
