"use client";

import { useState } from "react";
import { marked } from "marked";

export default function ContradictionDetector({ documentText, jurisdiction = "US Federal" }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!documentText?.trim()) {
      setError("Please load or paste a document first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contradictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: documentText, jurisdiction }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to scan for contradictions.");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Unable to connect to contradiction detector.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-action)", color: "var(--gold)", fontSize: "1.3rem", letterSpacing: "1px", margin: 0 }}>
            ⚡ "OBJECTION!" CONTRADICTION DETECTOR
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "4px 0 0 0" }}>
            Scans document for conflicting clauses, term clashes, and internal contract contradictions under {jurisdiction} law.
          </p>
        </div>
        <button
          className="run-btn"
          onClick={handleScan}
          disabled={loading || !documentText?.trim()}
          style={{ minHeight: "44px", padding: "8px 24px" }}
        >
          {loading ? "SCANNING RECORD..." : "RUN OBJECTION SCAN"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(224, 27, 36, 0.2)", border: "1.5px solid var(--prosecution-red)", color: "var(--paper)", marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div>
          {result.contradictions && result.contradictions.length > 0 ? (
            <div>
              <div style={{
                margin: "0 0 20px 0",
                padding: "16px 20px",
                background: "linear-gradient(135deg, rgba(224, 27, 36, 0.25), #120305)",
                border: "3px solid var(--prosecution-red)",
                boxShadow: "5px 5px 0 #000000",
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}>
                <div style={{
                  background: "var(--prosecution-red)",
                  color: "#fff",
                  fontFamily: "var(--font-action)",
                  fontSize: "1.8rem",
                  padding: "6px 16px",
                  transform: "rotate(-3deg)",
                  boxShadow: "3px 3px 0 #000",
                  letterSpacing: "1.5px"
                }}>
                  OBJECTION!
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-action)", fontSize: "1.2rem", color: "#ff667a" }}>
                    {result.contradictions.length} INTERNAL CONTRADICTION{result.contradictions.length > 1 ? "S" : ""} DETECTED
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--paper)" }}>
                    {result.summary}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {result.contradictions.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "16px",
                      background: "rgba(10, 15, 26, 0.9)",
                      border: "2px solid var(--gold)",
                      boxShadow: "4px 4px 0 #000000"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span className="court-speaker-badge badge-prosecution" style={{ fontSize: "0.8rem" }}>
                        ⚡ {c.objectionType || "Contract Conflict"}
                      </span>
                      <span style={{
                        padding: "2px 8px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        background: c.severity === "High" ? "var(--prosecution-red)" : "var(--gold)",
                        color: "#000"
                      }}>
                        {c.severity || "Medium"} Severity
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ padding: "10px", background: "rgba(224, 27, 36, 0.1)", borderLeft: "3px solid var(--prosecution-red)" }}>
                        <strong style={{ fontSize: "0.8rem", color: "#ff667a" }}>PROVISION #1:</strong>
                        <p style={{ fontSize: "0.85rem", color: "var(--paper)", margin: "4px 0 0 0" }}>{c.clause1}</p>
                      </div>
                      <div style={{ padding: "10px", background: "rgba(29, 112, 245, 0.1)", borderLeft: "3px solid var(--defense-blue)" }}>
                        <strong style={{ fontSize: "0.8rem", color: "var(--defense-blue)" }}>PROVISION #2:</strong>
                        <p style={{ fontSize: "0.85rem", color: "var(--paper)", margin: "4px 0 0 0" }}>{c.clause2}</p>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.88rem", color: "var(--paper)", marginBottom: "8px", lineHeight: "1.5" }}>
                      <strong>Contradiction Analysis:</strong> {c.explanation}
                    </div>

                    {c.recommendation && (
                      <div style={{ padding: "8px 12px", background: "rgba(255, 203, 61, 0.1)", border: "1px solid rgba(255, 203, 61, 0.3)", fontSize: "0.83rem", color: "var(--gold)" }}>
                        💡 <strong>Proposed Defense Fix:</strong> {c.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ border: "2px dashed var(--defense-blue)", padding: "30px" }}>
              <div style={{ fontSize: "2rem" }}>⚖️</div>
              <div style={{ fontFamily: "var(--font-action)", fontSize: "1.2rem", color: "var(--gold)" }}>
                NO INTERNAL CONTRADICTIONS FOUND
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: "4px 0 0 0" }}>
                {result.summary || "The document terms appear internally consistent."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
