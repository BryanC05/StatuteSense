import { NextResponse } from "next/server";
import { generateAnalysis } from "../../../lib/ai";

export async function POST(request) {
  const { clauseText, clauseTitle = "Target Clause", jurisdiction = "US Federal" } = await request.json();

  if (!clauseText || !clauseText.trim()) {
    return NextResponse.json({ error: "Clause text is required." }, { status: 400 });
  }

  const prompt = `You are an expert defense counsel negotiating a contract under ${jurisdiction} law.
Analyze the following aggressive or unbalanced prosecution clause and provide 3 distinct defense rewrites:

1. Balanced (Standard commercial benchmark, fair to both parties)
2. Aggressive Defense (Strongly favorable to defendant / recipient party)
3. Compromise Fallback (Middle-ground alternative for hard negotiations)

Original Clause:
${clauseText}

Return JSON in this format:
{
  "clauseTitle": "${clauseTitle}",
  "original": "${clauseText.replace(/"/g, '\\"')}",
  "balanced": "Balanced rewrite text...",
  "aggressive": "Aggressive defense rewrite text...",
  "compromise": "Compromise fallback text...",
  "explanation": "Key tactical rationale for the defense rewrites"
}`;

  try {
    const output = await generateAnalysis(prompt);
    const jsonMatch = output.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        return NextResponse.json(result);
      } catch {
        return NextResponse.json({
          clauseTitle,
          original: clauseText,
          balanced: output,
          aggressive: output,
          compromise: output,
          explanation: "Parsed from text output"
        });
      }
    }

    return NextResponse.json({
      clauseTitle,
      original: clauseText,
      balanced: output,
      aggressive: output,
      compromise: output,
      explanation: output
    });
  } catch (error) {
    console.error("Rewrite error:", error);
    return NextResponse.json({ error: error.message || "Clause rewrite failed." }, { status: 500 });
  }
}
