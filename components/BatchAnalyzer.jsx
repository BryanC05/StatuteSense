"use client";

import { useState } from "react";
import { marked } from "marked";

export default function BatchAnalyzer({ onDocumentSelect }) {
  const [files, setFiles] = useState([]);
  const [task, setTask] = useState("Summarize each contract and highlight key liabilities.");
  const [loading, setLoading] = useState(false);
  const [batchResults, setBatchResults] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleBatchSubmit = async () => {
    if (files.length === 0) {
      setError("Please select at least 1 document file.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    files.forEach((f) => formData.append("documents", f));
    formData.append("task", task);

    try {
      const res = await fetch("/api/batch-analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Batch analysis failed.");
      } else {
        setBatchResults(data);
      }
    } catch (err) {
      setError("Unable to process batch analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "8px" }}>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ fontFamily: "var(--font-action)", color: "var(--gold)", fontSize: "1.3rem", letterSpacing: "1px", margin: 0 }}>
          📁 BATCH EVIDENCE PORTFOLIO ANALYZER
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "4px 0 0 0" }}>
          Upload multiple contracts simultaneously to generate a consolidated risk and analysis matrix.
        </p>
      </div>

      <div style={{ padding: "16px", background: "rgba(10, 15, 26, 0.8)", border: "2px solid var(--gold)", marginBottom: "20px" }}>
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", color: "var(--gold)", marginBottom: "6px", fontFamily: "var(--font-action)" }}>
            SELECT MULTIPLE CONTRACT FILES (PDF / TXT):
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.txt"
            onChange={handleFileChange}
            style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid var(--gold)", color: "#fff" }}
          />
          {files.length > 0 && (
            <div style={{ fontSize: "0.82rem", color: "var(--paper)", marginTop: "6px" }}>
              Selected {files.length} document{files.length > 1 ? "s" : ""}: {files.map(f => f.name).join(", ")}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "0.85rem", color: "var(--gold)", marginBottom: "6px", fontFamily: "var(--font-action)" }}>
            ANALYSIS DIRECTIVE FOR PORTFOLIO:
          </label>
          <input
            type="text"
            className="chat-input"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            style={{ width: "100%", minHeight: "40px", fontSize: "0.9rem" }}
          />
        </div>

        <button
          className="run-btn"
          onClick={handleBatchSubmit}
          disabled={loading || files.length === 0}
          style={{ width: "100%", minHeight: "46px" }}
        >
          {loading ? `ANALYZING ${files.length} DOCUMENTS IN PARALLEL...` : `START BATCH PORTFOLIO ANALYSIS (${files.length} FILES)`}
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(224, 27, 36, 0.2)", border: "1.5px solid var(--prosecution-red)", color: "var(--paper)", marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

      {batchResults && (
        <div>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <div style={{ flex: 1, padding: "12px", background: "rgba(29, 112, 245, 0.15)", border: "2px solid var(--defense-blue)", textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>TOTAL PROCESSED</div>
              <div style={{ fontFamily: "var(--font-action)", fontSize: "1.6rem", color: "var(--gold)" }}>{batchResults.total}</div>
            </div>
            <div style={{ flex: 1, padding: "12px", background: "rgba(46, 204, 113, 0.15)", border: "2px solid #2ecc71", textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>SUCCESSFUL</div>
              <div style={{ fontFamily: "var(--font-action)", fontSize: "1.6rem", color: "#2ecc71" }}>{batchResults.success}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {batchResults.results?.map((res, idx) => (
              <div key={idx} style={{ padding: "16px", background: "rgba(10, 15, 26, 0.9)", border: "2px solid var(--gold)", boxShadow: "4px 4px 0 #000" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h4 style={{ margin: 0, fontFamily: "var(--font-action)", color: "var(--paper)", fontSize: "1.1rem" }}>
                    📄 {res.fileName}
                  </h4>
                  <span style={{ fontSize: "0.75rem", padding: "2px 8px", background: res.status === "success" ? "#2ecc71" : "var(--prosecution-red)", color: "#000", fontWeight: "bold" }}>
                    {res.status.toUpperCase()}
                  </span>
                </div>
                {res.status === "success" ? (
                  <div>
                    <div className="markdown-content" style={{ fontSize: "0.9rem", maxHeight: "250px", overflowY: "auto", paddingRight: "8px" }} dangerouslySetInnerHTML={{ __html: marked.parse(res.analysis || "") }} />
                    {res.document && (
                      <button
                        onClick={() => onDocumentSelect?.(res.document)}
                        className="record-primary-btn"
                        style={{ marginTop: "10px", minHeight: "34px", padding: "4px 12px", fontSize: "0.82rem" }}
                      >
                        ⚖️ OPEN IN DEFENSE DESK
                      </button>
                    )}
                  </div>
                ) : (
                  <p style={{ color: "var(--prosecution-red)", fontSize: "0.85rem", margin: 0 }}>Error: {res.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
