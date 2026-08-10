import OpenAI from "openai";

const MODEL = process.env.HUGGINGFACE_MODEL || "Qwen/Qwen2.5-72B-Instruct";
const HOST = process.env.HUGGINGFACE_API_HOST || "router.huggingface.co/v1";

export function getCurrentModel() {
  return MODEL;
}

export async function generateAnalysis(prompt) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error("HUGGINGFACE_API_KEY is not configured.");
  }

  const baseURL = HOST.startsWith("http") ? HOST : `https://${HOST}`;

  const client = new OpenAI({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    baseURL: baseURL,
  });

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an expert legal analysis assistant. STRICT ANTI-HALLUCINATION REQUIREMENT: DO NOT fabricate case citations, reporter volume/page numbers, Circuit courts, or non-existent statute section numbers. Only reference verified, real legal statutes (e.g., DTSA 18 U.S.C. § 1836, UTSA § 1(4), Restatement (Second) of Contracts § 71 & § 75, UCC Articles, GDPR Art. 6) and actual landmark precedents (such as E.I. du Pont de Nemours & Co. v. Christopher 431 F.2d 1012 (5th Cir. 1970), Rockwell Graphic Systems, Inc. v. DEV Industries, Inc. 925 F.2d 174 (7th Cir. 1991), Silvaco Data Systems v. Intel Corp. 184 Cal. App. 4th 210 (2010)). If unsure of a specific reporter volume/page, state the established legal rule without inventing fake citation numbers." },
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
