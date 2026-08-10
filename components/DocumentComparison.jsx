"use client";

import { useState } from "react";

export default function DocumentComparison() {
  const [doc1, setDoc1] = useState({ title: "Document 1", text: "" });
  const [doc2, setDoc2] = useState({ title: "Document 2", text: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!doc1.text.trim() || !doc2.text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text1: doc1.text,
          text2: doc2.text,
          title1: doc1.title,
          title2: doc2.title,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch {
      console.error("Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="record-header">
        <h3 className="record-title">Document Comparison</h3>
        <button
          className="record-primary-btn"
          onClick={handleCompare}
          disabled={loading || !doc1.text.trim() || !doc2.text.trim()}
        >
          {loading ? "Comparing..." : "Compare Documents"}
        </button>
      </div>

      <div className="compare-container">
        <div className="compare-pane">
          <input
            type="text"
            value={doc1.title}
            onChange={(e) => setDoc1({ ...doc1, title: e.target.value })}
            placeholder="Document 1 title"
            className="record-search"
            style={{ marginBottom: "10px" }}
          />
          <textarea
            value={doc1.text}
            onChange={(e) => setDoc1({ ...doc1, text: e.target.value })}
            placeholder="Paste first document here..."
          />
        </div>
        <div className="compare-pane">
          <input
            type="text"
            value={doc2.title}
            onChange={(e) => setDoc2({ ...doc2, title: e.target.value })}
            placeholder="Document 2 title"
            className="record-search"
            style={{ marginBottom: "10px" }}
          />
          <textarea
            value={doc2.text}
            onChange={(e) => setDoc2({ ...doc2, text: e.target.value })}
            placeholder="Paste second document here..."
          />
        </div>
      </div>

      {result && (
        <div className="compare-results">
          <div style={{ padding: "16px", background: "var(--panel-2)", border: "2px solid var(--line)", marginBottom: "16px" }}>
            <strong style={{ color: "var(--paper)" }}>Summary:</strong>
            <span style={{ color: "var(--muted)", marginLeft: "8px" }}>{result.summary}</span>
          </div>

          {result.added && result.added.length > 0 && (
            <div className="compare-section">
              <h4><span className="badge badge-added">Added</span> New in Document 2</h4>
              {result.added.map((item, idx) => (
                <div key={idx} className="compare-item compare-item-added">
                  <strong>{item.title}</strong>
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "4px" }}>{item.text}</p>
                  <span className="badge badge-modified">{item.impact} impact</span>
                </div>
              ))}
            </div>
          )}

          {result.removed && result.removed.length > 0 && (
            <div className="compare-section">
              <h4><span className="badge badge-removed">Removed</span> In Document 1 Only</h4>
              {result.removed.map((item, idx) => (
                <div key={idx} className="compare-item compare-item-removed">
                  <strong>{item.title}</strong>
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "4px" }}>{item.text}</p>
                  <span className="badge badge-modified">{item.impact} impact</span>
                </div>
              ))}
            </div>
          )}

          {result.modified && result.modified.length > 0 && (
            <div className="compare-section">
              <h4><span className="badge badge-modified">Modified</span> Changed Clauses</h4>
              {result.modified.map((item, idx) => (
                <div key={idx} className="compare-item compare-item-modified">
                  <strong>{item.title}</strong>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
                    <div>
                      <div style={{ color: "var(--red)", fontSize: "0.8rem", fontWeight: 700 }}>Original:</div>
                      <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{item.original}</p>
                    </div>
                    <div>
                      <div style={{ color: "var(--green)", fontSize: "0.8rem", fontWeight: 700 }}>Revised:</div>
                      <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{item.revised}</p>
                    </div>
                  </div>
                  <span className="badge badge-modified" style={{ marginTop: "8px" }}>{item.impact} impact</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
