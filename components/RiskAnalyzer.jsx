"use client";

import { useState } from "react";

export default function RiskAnalyzer({ documentText }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeRisk = async () => {
    if (!documentText?.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/risk-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: documentText }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch {
      console.error("Risk analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const level = result?.level || "moderate";

  return (
    <div>
      <div className="record-header">
        <h3 className="record-title">Risk & Threat Analysis</h3>
        <button
          className="run-btn"
          onClick={analyzeRisk}
          disabled={loading || !documentText?.trim()}
        >
          {loading ? "Analyzing..." : "Analyze Risk"}
        </button>
      </div>

      {!result && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">🛡️</div>
          <div className="empty-state-title">
            Risk & Threat Analysis
          </div>
          <p className="empty-state-desc">
            Scan document for legal risks, liability exposures, and potential contract issues.
          </p>
        </div>
      )}

      {result && (
        <div className="risk-meter">
          <div className="risk-score-display">
            <span className={`risk-score-number ${level}`}>{result.score}</span>
            <div>
              <div className={`risk-level-text ${level}`}>{level.toUpperCase()} RISK</div>
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                Scale: 0 (low) - 100 (critical)
              </div>
            </div>
          </div>
          <div className="risk-bar">
            <div className={`risk-bar-fill ${level}`} style={{ width: `${result.score}%` }} />
          </div>

          {result.risks && result.risks.length > 0 && (
            <div className="risk-factors">
              <h4 style={{ marginBottom: "8px", color: "var(--paper)", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase" }}>
                Risk Factors
              </h4>
              {result.risks.map((risk, idx) => (
                <div key={idx} className={`risk-factor ${risk.severity}`}>
                  <span className="badge" style={{
                    background: risk.severity === "high" ? "var(--red)" : risk.severity === "medium" ? "var(--gold)" : "var(--green)",
                    color: risk.severity === "medium" ? "#1a1a2e" : "white"
                  }}>
                    {risk.severity}
                  </span>
                  <div>
                    <strong>{risk.clause}</strong>
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{risk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
