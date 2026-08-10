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
        { role: "system", content: "You are a helpful and precise legal analysis assistant." },
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
