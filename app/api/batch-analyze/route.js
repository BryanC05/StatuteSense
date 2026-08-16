import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { generateAnalysis, getCurrentModel } from "../../../lib/ai";

import { checkRateLimit } from "../../../lib/rateLimit";

export async function POST(request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;
  const formData = await request.formData();
  const files = formData.getAll("documents");
  const task = formData.get("task")?.toString() || "Summarize the document.";

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No documents provided" }, { status: 400 });
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total
  
  const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    return NextResponse.json({ error: "Total file size exceeds 50MB limit." }, { status: 413 });
  }

  // Process documents in parallel (max 2 concurrent for PDFs)
  const MAX_CONCURRENT = 2;
  const results = [];

  const processDocument = async (file, index) => {
    try {
      const fileName = file.name || `doc-${index}`;
      const fileType = file.type === "application/pdf" ? "PDF" : "TXT";
      const fileSize = file.size;

      if (fileSize > MAX_FILE_SIZE) {
        return { index, fileName, status: "error", error: "File exceeds 10MB limit." };
      }

      let documentText = "";
      if (fileType === "PDF") {
        const parsed = await pdfParse(Buffer.from(await file.arrayBuffer()));
        documentText = parsed.text || "";
      } else {
        documentText = (Buffer.from(await file.arrayBuffer())).toString("utf-8");
      }

      if (!documentText.trim()) {
        return { index, fileName, status: "error", error: "Empty document" };
      }

      const analysisStart = Date.now();
      const prompt = `You are an expert legal analyst. Analyze the following document:\n\n${documentText}\n\nTask: ${task}`;
      const output = await generateAnalysis(prompt);
      const duration = Date.now() - analysisStart;

      return {
        index,
        fileName,
        status: "success",
        document: {
          title: fileName,
          originalText: documentText,
          fileName,
          fileType,
          fileSize,
          documentType: "Other",
        },
        analysis: output,
        duration,
        modelUsed: getCurrentModel(),
      };
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      return { index, fileName: file.name, status: "error", error: error.message };
    }
  };

  // Process in batches
  for (let i = 0; i < files.length; i += MAX_CONCURRENT) {
    const batch = files.slice(i, i + MAX_CONCURRENT);
    const batchResults = await Promise.all(
      batch.map((file, idx) => processDocument(file, i + idx))
    );
    results.push(...batchResults);
  }

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return NextResponse.json({
    total: files.length,
    success: successCount,
    errors: errorCount,
    results,
  });
}
