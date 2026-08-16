import OpenAI from "openai";

const MODEL = process.env.HUGGINGFACE_MODEL || "Qwen/Qwen2.5-72B-Instruct";
const HOST = process.env.HUGGINGFACE_API_HOST || "router.huggingface.co/v1";
const baseURL = HOST.startsWith("http") ? HOST : `https://${HOST}`;

export const openai = new OpenAI({
  apiKey: process.env.HUGGINGFACE_API_KEY || "dummy",
  baseURL: baseURL,
});

export function getCurrentModel() {
  return MODEL;
}

export async function generateAnalysis(prompt) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error("HUGGINGFACE_API_KEY is not configured.");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an expert legal analysis assistant. STRICT ANTI-HALLUCINATION REQUIREMENT: DO NOT fabricate case citations, reporter volume/page numbers, Circuit courts, or non-existent statute section numbers. Only reference verified, real legal statutes (DTSA 18 U.S.C. § 1836, UTSA § 1(4), Restatement (Second) of Contracts § 71 & § 75) and actual landmark precedents (E.I. du Pont de Nemours & Co. v. Christopher 431 F.2d 1012 (5th Cir. 1970), Rockwell Graphic Systems, Inc. v. DEV Industries, Inc. 925 F.2d 174 (7th Cir. 1991), Silvaco Data Systems v. Intel Corp. 184 Cal. App. 4th 210 (2010)). CONTEXT RULES: Only cite UCC Article 2 if physical/tangible goods are involved. Only cite GDPR Art. 6 / CCPA / DPA requirements if PII or personal data is present in the text." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    return completion.choices?.[0]?.message?.content || "";
  } catch (error) {
    throw new Error(`Hugging Face Router API error: ${error.message || error}`);
  }
}

export default generateAnalysis;

