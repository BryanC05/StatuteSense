"use client";

import { useState } from "react";

const FRAMEWORKS = [
  { id: "gdpr", name: "GDPR", description: "EU General Data Protection Regulation" },
  { id: "ccpa", name: "CCPA", description: "California Consumer Privacy Act" },
  { id: "hipaa", name: "HIPAA", description: "Health Insurance Portability and Accountability Act" },
];

export default function ComplianceChecker({ documentText }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState("gdpr");

  const checkCompliance = async () => {
    if (!documentText?.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: documentText, framework: selectedFramework }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch {
      console.error("Compliance check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="record-header">
        <h3 className="record-title">Compliance Checker</h3>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {FRAMEWORKS.map((fw) => (
          <button
            key={fw.id}
            onClick={() => setSelectedFramework(fw.id)}
            style={{
              padding: "10px 16px",
              background: selectedFramework === fw.id ? "var(--red)" : "var(--panel-2)",
              border: `2px solid ${selectedFramework === fw.id ? "var(--gold)" : "var(--line)"}`,
              color: selectedFramework === fw.id ? "white" : "var(--text)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {fw.name}
          </button>
        ))}
        <button
          className="record-primary-btn"
          onClick={checkCompliance}
          disabled={loading || !documentText?.trim()}
        >
          {loading ? "Checking..." : "Run Check"}
        </button>
      </div>

      {!result && !loading && (
        <div className="empty-state" style={{ minHeight: "200px" }}>
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title">Compliance Check</div>
          <p className="empty-state-desc">
            Verify your document against regulatory frameworks.
          </p>
        </div>
      )}

      {result && (
        <div>
          <div className="compliance-score">
            <div className="compliance-score-number" style={{
              color: result.overallScore >= 75 ? "var(--green)" :
                     result.overallScore >= 50 ? "var(--gold)" : "var(--red)"
            }}>
              {result.overallScore}%
            </div>
            <div style={{ color: "var(--muted)" }}>{result.framework} Compliance</div>
          </div>

          <div className="compliance-results">
            {result.results?.map((item, idx) => (
              <div key={idx} className="compliance-item">
                <span className={`compliance-status ${item.status}`}>
                  {item.status === "yes" ? "✓" : item.status === "partial" ? "~" : "✗"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.requirement}</div>
                  {item.evidence && (
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                      {item.evidence}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {result.gaps && result.gaps.length > 0 && (
            <div style={{ marginTop: "16px", padding: "16px", background: "rgba(113, 26, 34, 0.2)", border: "1px solid var(--red)" }}>
              <h4 style={{ color: "var(--red)", marginBottom: "8px" }}>⚠️ Gaps Identified</h4>
              <ul style={{ paddingLeft: "20px", color: "var(--muted)" }}>
                {result.gaps.map((gap, idx) => (
                  <li key={idx}>{gap}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
