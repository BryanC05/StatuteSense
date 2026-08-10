import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { generateAnalysis, getCurrentModel } from "../../../lib/ai";

function buildAnalysisPrompt(documentText, task, docType) {
  return `You are an expert legal analyst. Analyze the following ${docType} and provide a clear response for the requested task.

Document:
${documentText}

Task:
${task}

CRITICAL LEGAL CITATION & ANTI-HALLUCINATION INSTRUCTIONS:
1. STRICT ACCURACY: NEVER fabricate case names, reporter volume/page numbers (e.g. F.2d/F.3d citations), Circuit courts, or non-existent statute section numbers.
2. VERIFIED SOURCES: Ground your analysis in real, verified statutory codes and landmark case law (e.g., DTSA 18 U.S.C. § 1836 et seq., UTSA § 1(4), Restatement (Second) of Contracts § 71 & § 75, E.I. du Pont de Nemours & Co. v. Christopher 431 F.2d 1012 (5th Cir. 1970), Rockwell Graphic Systems, Inc. v. DEV Industries, Inc. 925 F.2d 174 (7th Cir. 1991), Silvaco Data Systems v. Intel Corp. 184 Cal. App. 4th 210 (2010), UCC Article 2, GDPR Art. 6, CCPA § 1798.100).
3. Include a dedicated section titled "### 📜 Validated Legal Sources & Case Law References" at the end listing verified statutes, regulations, and case citations for reference.
4. Return the answer in structured Markdown.`;
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
