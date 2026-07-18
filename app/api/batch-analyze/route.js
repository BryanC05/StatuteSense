import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { generateAnalysis } from "../../../lib/ai";
import prisma from "../../../lib/db";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("documents");
  const task = formData.get("task")?.toString() || "Summarize the document.";
  const userId = session.user?.email || "unknown";

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

      // Save document
      const savedDoc = await prisma.document.create({
        data: {
          userId,
          title: fileName,
          originalText: documentText,
          fileName,
          fileType,
          fileSize,
          documentType: "Other",
        },
      });

      // Run analysis
      const analysisStart = Date.now();
      const prompt = `You are an expert legal analyst. Analyze the following document:\n\n${documentText}\n\nTask: ${task}`;
      const output = await generateAnalysis(prompt);
      const duration = Date.now() - analysisStart;

      // Save analysis
      await prisma.analysisResult.create({
        data: {
          userId,
          documentId: savedDoc.id,
          prompt: task,
          result: output,
          modelUsed: process.env.AI_PROVIDER || "huggingface",
          duration,
        },
      });

      return {
        index,
        fileName,
        status: "success",
        documentId: savedDoc.id,
        analysis: output,
        duration,
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
