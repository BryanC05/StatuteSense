import { NextResponse } from "next/server";
import { generateAnalysis } from "../../../lib/ai";

export async function POST(request) {
  const { message, documentText, history } = await request.json();

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const systemPrompt = `You are a legal analysis assistant. You help users understand legal documents. 
${documentText ? `The user is analyzing this document:\n\n${documentText}\n\n` : ""}Answer questions clearly and concisely. If you're unsure, say so. Do not provide legal advice - only general information about legal concepts and document interpretation.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...(history || []).slice(-10).map((h) => ({
      role: h.role,
      content: h.content,
    })),
    { role: "user", content: message },
  ];

  try {
    const { default: OpenAI } = await import("openai");
    const HOST = process.env.HUGGINGFACE_API_HOST || "router.huggingface.co/v1";
    const MODEL = process.env.HUGGINGFACE_MODEL || "Qwen/Qwen2.5-72B-Instruct";

    const client = new OpenAI({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      baseURL: HOST.startsWith("http") ? HOST : `https://${HOST}`,
    });

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    const output = completion.choices?.[0]?.message?.content || "I couldn't generate a response.";
    return NextResponse.json({ response: output });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message || "Chat failed." }, { status: 500 });
  }
}
