"use client";

import { useState } from "react";

export default function ClauseRedliner({ onInsertRewrite, jurisdiction = "US Federal" }) {
  const [clauseText, setClauseText] = useState("");
  const [clauseTitle, setClauseTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("balanced");

  const handleRewrite = async () => {
    if (!clauseText.trim()) {
      setError("Please paste a clause to rewrite.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clauseText: clauseText.trim(),
          clauseTitle: clauseTitle.trim() || "Target Clause",
          jurisdiction
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Clause rewrite failed.");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Unable to connect to clause rewriter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "8px" }}>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ color: "var(--gold)", fontSize: "1.3rem", margin: 0 }}>
          Clause Redline & Rewrite
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "4px 0 0 0" }}>
          Select or paste a clause to generate 3 tailored alternative rewrites under {jurisdiction} law.
        </p>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <input
          type="text"
          className="chat-input"
          placeholder="Clause Title (e.g. Limitation of Liability, Indemnity)..."
          value={clauseTitle}
          onChange={(e) => setClauseTitle(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", minHeight: "40px", fontSize: "0.9rem" }}
        />
        <textarea
          className="custom-prompt-input"
          rows={4}
          placeholder="Paste clause text here to generate revisions..."
          value={clauseText}
          onChange={(e) => setClauseText(e.target.value)}
          style={{ width: "100%", fontSize: "0.9rem" }}
        />
        <div style={{ marginTop: "10px", textAlign: "right" }}>
          <button
            className="run-btn"
            onClick={handleRewrite}
            disabled={loading || !clauseText.trim()}
            style={{ minHeight: "44px", padding: "8px 24px" }}
          >
            {loading ? "Generating Rewrites..." : "Generate Rewrites"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(224, 27, 36, 0.2)", border: "1.5px solid var(--prosecution-red)", color: "var(--paper)", marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "20px", padding: "18px", background: "rgba(10, 15, 26, 0.9)", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
            <button
              className={`tab-btn-clean ${activeTab === "balanced" ? "active" : ""}`}
              onClick={() => setActiveTab("balanced")}
            >
              Balanced Commercial
            </button>
            <button
              className={`tab-btn-clean ${activeTab === "aggressive" ? "active" : ""}`}
              onClick={() => setActiveTab("aggressive")}
            >
              Suggested Rewrite (Protective)
            </button>
            <button
              className={`tab-btn-clean ${activeTab === "compromise" ? "active" : ""}`}
              onClick={() => setActiveTab("compromise")}
            >
              Compromise Fallback
            </button>
          </div>

          <div style={{ padding: "14px", background: "rgba(255, 255, 255, 0.04)", borderLeft: "3px solid var(--gold)", marginBottom: "12px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--gold)", marginBottom: "6px", fontWeight: "600" }}>
              {activeTab === "balanced" && "BALANCED COMMERCIAL BENCHMARK:"}
              {activeTab === "aggressive" && "SUGGESTED REWRITE (CLIENT FAVORABLE):"}
              {activeTab === "compromise" && "MIDDLE-GROUND COMPROMISE FALLBACK:"}
            </div>
            <p style={{ fontSize: "0.95rem", color: "var(--paper)", lineHeight: "1.6", margin: 0 }}>
              {result[activeTab]}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", gap: "12px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              {result.explanation}
            </span>
            <button
              className="record-primary-btn"
              onClick={() => onInsertRewrite?.(result[activeTab])}
              style={{ minHeight: "36px", padding: "4px 16px", whiteSpace: "nowrap" }}
            >
              📋 Insert Rewrite into Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
