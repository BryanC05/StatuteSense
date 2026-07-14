import OpenAI from "openai";

const HF_DEFAULT_MODEL = process.env.HUGGINGFACE_MODEL || "Qwen/Qwen2.5-72B-Instruct";
const HF_DEFAULT_HOST = process.env.HUGGINGFACE_API_HOST || "router.huggingface.co/v1";

async function callHuggingFace(prompt) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error("HUGGINGFACE_API_KEY is not configured.");
  }

  const model = HF_DEFAULT_MODEL;
  const host = process.env.HUGGINGFACE_API_HOST || HF_DEFAULT_HOST;
  const baseURL = host.startsWith("http") ? host : `https://${host}`;

  const client = new OpenAI({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    baseURL: baseURL,
  });

  try {
    const completion = await client.chat.completions.create({
      model: model,
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

async function callOpenAI(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful and precise legal analysis assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 1200,
  });

  return completion.choices?.[0]?.message?.content || "";
}

export async function generateAnalysis(prompt) {
  // Default to Hugging Face if AI_PROVIDER is not set
  const provider = (process.env.AI_PROVIDER || "huggingface").toLowerCase();
  if (provider === "huggingface" || provider === "hf") {
    return await callHuggingFace(prompt);
  }

  // default to OpenAI
  return await callOpenAI(prompt);
}

export default generateAnalysis;
