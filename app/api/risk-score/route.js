import { NextResponse } from "next/server";
import { generateAnalysis } from "../../../lib/ai";

export async function POST(request) {
  const { text } = await request.json();

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Document text is required." }, { status: 400 });
  }

  const prompt = `Analyze the following legal document and provide a risk assessment.

Rate the overall document risk from 0-100 where:
- 0-25: Low risk (standard terms, balanced obligations)
- 26-50: Moderate risk (some concerning clauses, minor imbalances)
- 51-75: High risk (significant one-sided terms, potential liabilities)
- 76-100: Critical risk (severe penalties, unlimited liability, missing protections)

Also identify specific risk factors with severity (low/medium/high) and cite applicable statutory rules or case law principles (e.g. UCC § 2-302 unconscionability, Restatement § 208, GDPR Art. 82 liability, limitation of liability precedents).

Return JSON in this format:
{
  "score": 45,
  "level": "moderate",
  "risks": [
    {"clause": "Termination", "severity": "medium", "description": "Explanation including statutory/case law citation (e.g. UCC § 2-309)..."}
  ]
}

Document:
${text}`;

  try {
    const output = await generateAnalysis(prompt);
    const jsonMatch = output.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        return NextResponse.json(result);
      } catch {
        return NextResponse.json(parseRiskFromText(output));
      }
    }

    return NextResponse.json(parseRiskFromText(output));
  } catch (error) {
    console.error("Risk scoring error:", error);
    return NextResponse.json({ error: error.message || "Risk scoring failed." }, { status: 500 });
  }
}

function parseRiskFromText(text) {
  const scoreMatch = text.match(/risk\s*(score)?:?\s*(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[2]) : 50;

  let level = "moderate";
  if (score <= 25) level = "low";
  else if (score <= 50) level = "moderate";
  else if (score <= 75) level = "high";
  else level = "critical";

  return { score, level, risks: [] };
}
