"use client";

import { useState } from "react";
import { searchDocuments, searchClauses } from "../lib/storage";

export default function SearchBar({ onDocumentSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ documents: [], clauses: [] });
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    const documents = searchDocuments(query);
    const clauses = searchClauses(query);
    setResults({ documents, clauses });
    setSearched(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const totalResults = results.documents.length + results.clauses.length;

  return (
    <div>
      <div className="record-header">
        <h3 className="record-title" style={{ fontFamily: "var(--font-header)" }}>EVIDENCE VAULT SEARCH</h3>
      </div>

      <div className="search-bar" style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search evidence, contracts, clauses, tags..."
          style={{ flex: 1, minHeight: "52px" }}
        />
        <button className="run-btn" onClick={handleSearch} style={{ minHeight: "52px", padding: "10px 24px" }}>
          SEARCH VAULT
        </button>
      </div>

      {searched && (
        <div style={{ color: "var(--muted)", marginBottom: "16px", fontSize: "0.9rem" }}>
          Found {totalResults} result{totalResults !== 1 ? "s" : ""}
        </div>
      )}

      {searched && totalResults === 0 && (
        <div className="empty-state" style={{ minHeight: "150px" }}>
          <p>No results found for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {results.documents.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ color: "var(--paper)", marginBottom: "10px", fontFamily: "'Cinzel', serif", textTransform: "uppercase", fontSize: "0.9rem" }}>
            Documents ({results.documents.length})
          </h4>
          <div className="record-list">
            {results.documents.map((doc) => (
              <div
                key={doc.id}
                className="record-item"
                style={{ cursor: "pointer" }}
                onClick={() => onDocumentSelect?.(doc)}
              >
                <div className="record-item-main">
                  <div className="record-item-title">{doc.title}</div>
                  <div className="record-meta">
                    {doc.documentType} &bull; {new Date(doc.createdAt).toLocaleDateString()}
                    {doc.tags?.length > 0 && ` &bull; Tags: ${doc.tags.join(", ")}`}
                  </div>
                </div>
                <button className="record-primary-btn">Open</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.clauses.length > 0 && (
        <div>
          <h4 style={{ color: "var(--paper)", marginBottom: "10px", fontFamily: "'Cinzel', serif", textTransform: "uppercase", fontSize: "0.9rem" }}>
            Clauses ({results.clauses.length})
          </h4>
          <div className="clause-library">
            {results.clauses.map((clause) => (
              <div key={clause.id} className="clause-card">
                <div className="clause-card-title">{clause.title}</div>
                <div style={{ color: "var(--gold)", fontSize: "0.8rem" }}>{clause.category}</div>
                <div className="clause-card-content">{clause.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
