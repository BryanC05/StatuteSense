import { NextResponse } from "next/server";
import { generateAnalysis } from "../../../lib/ai";
import { extractJson } from "../../../lib/jsonExtract";
import { checkRateLimit } from "../../../lib/rateLimit";

const FRAMEWORKS = {
  gdpr: {
    name: "GDPR",
    checks: [
      "Data processing purpose specified",
      "Legal basis for processing defined",
      "Data subject rights addressed",
      "Data retention period specified",
      "Data breach notification procedure",
      "Data Protection Officer contact",
      "Cross-border transfer safeguards",
    ],
  },
  ccpa: {
    name: "CCPA",
    checks: [
      "Right to know/disclose",
      "Right to delete",
      "Right to opt-out of sale",
      "Non-discrimination clause",
      "Financial incentive notice",
      "Categories of personal information",
    ],
  },
  hipaa: {
    name: "HIPAA",
    checks: [
      "PHI safeguards described",
      "Business associate requirements",
      "Breach notification procedures",
      "Minimum necessary standard",
      "Patient rights provisions",
      "Administrative safeguards",
    ],
  },
};

export async function POST(request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;
  const { text, framework } = await request.json();

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Document text is required." }, { status: 400 });
  }

  if (!framework || !FRAMEWORKS[framework]) {
    return NextResponse.json({ error: "Invalid framework. Choose: gdpr, ccpa, hipaa" }, { status: 400 });
  }

  const fw = FRAMEWORKS[framework];
  const prompt = `Check the following document for compliance with ${fw.name} requirements.

For each requirement below, indicate if the document addresses it (yes/partial/no) and provide evidence or note the gap.

Requirements:
${fw.checks.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Return JSON in this format:
{
  "framework": "${fw.name}",
  "overallScore": 75,
  "results": [
    {"requirement": "...", "status": "yes|partial|no", "evidence": "..."}
  ],
  "gaps": ["List of major gaps found"]
}

Document:
${text}`;

  try {
    const output = await generateAnalysis(prompt);
    const result = extractJson(output);
    if (result) {
      return NextResponse.json(result);
    }

    return NextResponse.json({
      framework: fw.name,
      overallScore: 0,
      results: fw.checks.map((c) => ({ requirement: c, status: "no", evidence: "" })),
      gaps: ["Unable to parse compliance results"],
    });
  } catch (error) {
    console.error("Compliance check error:", error);
    return NextResponse.json({ error: error.message || "Compliance check failed." }, { status: 500 });
  }
}

export async function GET(request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;
  return NextResponse.json({ frameworks: Object.keys(FRAMEWORKS) });
}
