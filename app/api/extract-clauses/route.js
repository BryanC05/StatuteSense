import { NextResponse } from "next/server";
import { generateAnalysis, getCurrentModel } from "../../../lib/ai";

export async function POST(request) {
  const { text } = await request.json();

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Document text is required." }, { status: 400 });
  }

  const prompt = `Extract all distinct legal clauses from the following document. For each clause, provide:
1. A short title (e.g., "Termination Clause", "Force Majeure", "Payment Terms")
2. The exact text of the clause
3. A brief one-sentence summary

Format your response as a JSON array like this:
[
  {"title": "Clause Title", "text": "Exact clause text...", "summary": "Brief summary..."}
]

Document:
${text}`;

  try {
    const output = await generateAnalysis(prompt);
    const jsonMatch = output.match(/\[[\s\S]*\]/);
    let clauses = [];

    if (jsonMatch) {
      try {
        clauses = JSON.parse(jsonMatch[0]);
      } catch {
        clauses = parseClausesFromText(output);
      }
    } else {
      clauses = parseClausesFromText(output);
    }

    return NextResponse.json({ clauses });
  } catch (error) {
    console.error("Clause extraction error:", error);
    return NextResponse.json({ error: error.message || "Extraction failed." }, { status: 500 });
  }
}

function parseClausesFromText(text) {
  const lines = text.split("\n");
  const clauses = [];
  let current = null;

  for (const line of lines) {
    const titleMatch = line.match(/^\d+[\.\)]\s*(.+)$/) || line.match(/^[-•]\s*(.+)$/);
    if (titleMatch && titleMatch[1].length < 100) {
      if (current) clauses.push(current);
      current = { title: titleMatch[1].trim(), text: "", summary: "" };
    } else if (current) {
      current.text += line + "\n";
    }
  }
  if (current) clauses.push(current);

  return clauses.filter((c) => c.text.trim().length > 20);
}
