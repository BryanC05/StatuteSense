import { NextResponse } from "next/server";
import { generateAnalysis } from "../../../lib/ai";

import { checkRateLimit } from "../../../lib/rateLimit";

export async function POST(request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;
  const { text } = await request.json();

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Text is required for translation." }, { status: 400 });
  }

  const prompt = `You are an expert legal communicator. Translate the following complex legal document or court brief into clear, 8th-grade level, plain English ("Jury & Executive Summary").

Requirements:
- Strip away dense legalese, Latin phrases (e.g. inter alia, prima facie), and archaic boilerplate.
- Use clear bullet points and plain language terms (e.g., "What this means for you", "What you must do", "What could go wrong").
- Provide 3 key takeaways at the top.

Document/Brief Text:
${text}`;

  try {
    const output = await generateAnalysis(prompt);
    return NextResponse.json({ translatedText: output });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: error.message || "Translation failed." }, { status: 500 });
  }
}
