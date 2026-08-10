import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { generateAnalysis, getCurrentModel } from "../../../lib/ai";

function buildAnalysisPrompt(documentText, task, docType) {
  return `You are an expert legal analyst. Analyze the following ${docType} and provide a clear response for the requested task.

Document:
${documentText}

Task:
${task}

CRITICAL LEGAL CITATION INSTRUCTIONS:
- You MUST identify and list relevant real statutes, statutory provisions (e.g. UCC Articles, Restatement of Contracts, GDPR Articles, statutory codes), and established legal case precedents that apply to or reference the document clauses.
- Include a dedicated section titled "### 📜 Legal Sources & Case Law References" at the end listing applicable statutes, regulations, and case law citations for reference.
- Return the answer in a clear structured Markdown format.`;
}

export async function POST(request) {
  const formData = await request.formData();
  const text = formData.get("text")?.toString() || "";
  const task = formData.get("task")?.toString() || "Summarize the document and highlight key clauses.";
  const docType = formData.get("docType")?.toString() || "legal document";
  const documentFile = formData.get("document");

  let documentText = "";
  let fileName = null;
  let fileType = "TXT";
  let fileSize = null;

  if (documentFile && typeof documentFile === "object" && "arrayBuffer" in documentFile) {
    fileName = documentFile.name || "uploaded-file";
    fileSize = documentFile.size;
    fileType = documentFile.type === "application/pdf" ? "PDF" : "TXT";

    if (documentFile.type === "application/pdf") {
      const parsed = await pdfParse(Buffer.from(await documentFile.arrayBuffer()));
      documentText = parsed.text || "";
    } else {
      documentText = (Buffer.from(await documentFile.arrayBuffer())).toString("utf-8");
    }
  }

  const finalText = documentText.trim() || text.trim();
  if (!finalText) {
    return NextResponse.json({ error: "Please provide document text or upload a PDF/text file." }, { status: 400 });
  }

  const prompt = buildAnalysisPrompt(finalText, task, docType);

  try {
    const analysisStart = Date.now();
    const output = await generateAnalysis(prompt);
    const duration = Date.now() - analysisStart;

    return NextResponse.json({
      output,
      document: {
        title: fileName || `Document ${new Date().toISOString().slice(0, 10)}`,
        originalText: finalText,
        fileName,
        fileType,
        fileSize,
        documentType: docType,
      },
      metadata: {
        modelUsed: getCurrentModel(),
        duration,
      },
    });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: err.message || "Analysis failed." }, { status: 500 });
  }
}
