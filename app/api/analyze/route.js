import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function buildAnalysisPrompt(documentText, task, docType) {
  return `You are an expert legal analyst. Analyze the following ${docType} and provide a clear response for the requested task.\n\nDocument:\n${documentText}\n\nTask:\n${task}\n\nReturn the answer in a structured format with headings where helpful.`;
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const text = formData.get("text")?.toString() || "";
  const task = formData.get("task")?.toString() || "Summarize the document and highlight key clauses.";
  const docType = formData.get("docType")?.toString() || "legal document";
  const documentFile = formData.get("document");

  let documentText = "";

  if (documentFile && typeof documentFile === "object" && "arrayBuffer" in documentFile) {
    const fileBuffer = Buffer.from(await documentFile.arrayBuffer());

    if (documentFile.type === "application/pdf") {
      const parsed = await pdfParse(fileBuffer);
      documentText = parsed.text || "";
    } else {
      documentText = fileBuffer.toString("utf-8");
    }
  }

  const finalText = documentText.trim() || text.trim();
  if (!finalText) {
    return NextResponse.json({ error: "Please provide document text or upload a PDF/text file." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  const prompt = buildAnalysisPrompt(finalText, task, docType);
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful and precise legal analysis assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 1200,
  });

  const output = completion.choices?.[0]?.message?.content || "";
  return NextResponse.json({ output });
}
