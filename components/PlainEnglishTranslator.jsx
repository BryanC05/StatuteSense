"use client";

import { useState } from "react";
import { marked } from "marked";

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
    <div style={{ padding: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-action)", color: "var(--gold)", fontSize: "1.3rem", letterSpacing: "1px", margin: 0 }}>
            🏛️ JURY-FRIENDLY PLAIN ENGLISH TRANSLATOR
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "4px 0 0 0" }}>
            Translates dense legalese into clear, 8th-grade level executive summaries for non-lawyers.
          </p>
        </div>
        <button
          className="run-btn"
          onClick={handleTranslate}
          disabled={loading || !documentText?.trim()}
          style={{ minHeight: "44px", padding: "8px 24px" }}
        >
          {loading ? "TRANSLATING LEGALESE..." : "TRANSLATE TO PLAIN ENGLISH"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(224, 27, 36, 0.2)", border: "1.5px solid var(--prosecution-red)", color: "var(--paper)", marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

      {translation && (
        <div style={{ padding: "20px", background: "rgba(10, 15, 26, 0.9)", border: "2px solid var(--gold)", boxShadow: "4px 4px 0 #000" }}>
          <div style={{ fontFamily: "var(--font-action)", color: "var(--gold)", fontSize: "1.1rem", marginBottom: "12px", letterSpacing: "0.5px" }}>
            📖 JURY & EXECUTIVE SUMMARY
          </div>
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: marked.parse(translation) }}
          />
        </div>
      )}
    </div>
  );
}
