"use client";

import { useState } from "react";
import { marked } from "marked";
import { sanitizeHtml } from "@/lib/sanitize";

export default function PlainEnglishTranslator({ documentText }) {
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!documentText?.trim()) {
      setError("Please load or paste document text first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: documentText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Translation failed.");
      } else {
        setTranslation(data.translatedText || "");
      }
    } catch (err) {
      setError("Unable to connect to plain English translator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="record-header">
        <div>
          <h3 className="record-title">Plain English Translation</h3>
          <p className="record-meta" style={{ marginTop: "4px" }}>
            Translates dense legalese into clear, plain English summaries.
          </p>
        </div>
        <button
          className="run-btn"
          onClick={handleTranslate}
          disabled={loading || !documentText?.trim()}
        >
          {loading ? "Translating..." : "Translate to Plain English"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(224, 27, 36, 0.2)", border: "1px solid var(--red)", color: "var(--paper)", marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

      {translation && (
        <div style={{ padding: "20px", background: "var(--panel-2)", border: "1px solid var(--line)" }}>
          <div style={{ color: "var(--gold)", fontSize: "1rem", fontWeight: 700, marginBottom: "12px" }}>
            Plain English Summary
          </div>
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(marked.parse(translation)) }}
          />
        </div>
      )}
    </div>
  );
}
