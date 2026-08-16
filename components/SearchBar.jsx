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
        <h3 className="record-title">EVIDENCE VAULT SEARCH</h3>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search evidence, contracts, clauses, tags..."
        />
        <button className="run-btn" onClick={handleSearch}>
          SEARCH VAULT
        </button>
      </div>

      {searched && (
        <p className="record-muted">
          Found {totalResults} result{totalResults !== 1 ? "s" : ""}
        </p>
      )}

      {searched && totalResults === 0 && (
        <div className="empty-state">
          <p>No results found for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {results.documents.length > 0 && (
        <div>
          <h4 className="record-title">
            Documents ({results.documents.length})
          </h4>
          <div className="record-list">
            {results.documents.map((doc) => (
              <div
                key={doc.id}
                className="record-item"
                onClick={() => onDocumentSelect?.(doc)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDocumentSelect?.(doc); } }}
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
          <h4 className="record-title">
            Clauses ({results.clauses.length})
          </h4>
          <div className="clause-library">
            {results.clauses.map((clause) => (
              <div key={clause.id} className="clause-card">
                <div className="clause-card-title">{clause.title}</div>
                <div className="record-meta">{clause.category}</div>
                <div className="clause-card-content">{clause.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
