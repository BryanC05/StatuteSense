import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { generateAnalysis, getCurrentModel } from "../../../lib/ai";

export async function POST(request) {
  const formData = await request.formData();
  const files = formData.getAll("documents");
  const task = formData.get("task")?.toString() || "Summarize the document.";

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No documents provided" }, { status: 400 });
  }

  // Process documents in parallel (max 5 concurrent)
  const MAX_CONCURRENT = 5;
  const results = [];

  const processDocument = async (file, index) => {
    try {
      const fileName = file.name || `doc-${index}`;
      const fileType = file.type === "application/pdf" ? "PDF" : "TXT";
      const fileSize = file.size;

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
