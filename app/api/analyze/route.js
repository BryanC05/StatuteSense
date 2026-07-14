import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { generateAnalysis } from "../../../lib/ai";

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

  // If using OpenAI provider, ensure the key exists. Otherwise allow other providers (e.g. Hugging Face).
  const provider = (process.env.AI_PROVIDER || "huggingface").toLowerCase();
  if (provider === "openai" && !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured (set AI_PROVIDER or provide the key)." }, { status: 500 });
  }

  const prompt = buildAnalysisPrompt(finalText, task, docType);
  try {
    const output = await generateAnalysis(prompt);
    return NextResponse.json({ output });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: err.message || "Analysis failed." }, { status: 500 });
  }
}
