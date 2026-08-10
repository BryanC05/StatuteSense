"use client";

import { useState, useEffect, useCallback } from "react";
import { getDocuments, getAnalyses, deleteDocument, getFolders, updateDocument } from "../lib/storage";
import FolderManager from "./FolderManager";
import CustomSelect from "./CustomSelect";

export default function DocumentHistory({ onDocumentSelect }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const fetchDocuments = useCallback(() => {
    setLoading(true);
    const docs = getDocuments();
    const analyses = getAnalyses();

    const docsWithAnalyses = docs.map((doc) => ({
      ...doc,
      analyses: analyses.filter((a) => a.documentId === doc.id),
    }));

    setDocuments(docsWithAnalyses);
    setLoading(false);
  }, []);

  const fetchFolders = useCallback(() => {
    setFolders(getFolders());
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders, documents]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.documentType === filterType;
    const matchesFolder = selectedFolderId === null || doc.folderId === selectedFolderId;
    return matchesSearch && matchesType && matchesFolder;
  });

  const handleQuickReAnalyze = (doc) => {
    if (onDocumentSelect) {
      onDocumentSelect(doc);
    }
  };

  const handleViewAnalysis = (doc) => {
    if (onDocumentSelect) {
      onDocumentSelect(doc);
    }
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this document and its analyses?")) return;
    deleteDocument(id);
    setDocuments(documents.filter((d) => d.id !== id));
  };

  const handleClearAll = () => {
    if (!confirm("This will delete ALL documents and analyses from local history. Continue?")) return;
    localStorage.removeItem("statutesense_documents");
    localStorage.removeItem("statutesense_analyses");
    setDocuments([]);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatText = (text, maxLen = 200) => {
    if (!text) return "";
    const cleaned = text.replace(/[#*_\-`]/g, "").replace(/\n+/g, " ").trim();
    return cleaned.length > maxLen ? cleaned.substring(0, maxLen) + "..." : cleaned;
  };

  return (
    <div className="record-panel">
      <div className="record-header">
        <div>
          <span className="panel-number" style={{ background: "linear-gradient(135deg, var(--prosecution-red), var(--prosecution-red-dark))" }}>COURT ARCHIVE</span>
          <h2 className="record-title" style={{ fontFamily: "var(--font-header)", letterSpacing: "0.5px" }}>OFFICIAL COURT RECORD</h2>
        </div>
        {documents.length > 0 && (
          <button onClick={handleClearAll} className="record-clear-btn">
            Clear All
          </button>
        )}
      </div>

      <FolderManager selectedFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} />

      <div className="record-controls">
        <input
          type="text"
          placeholder="Search case files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="record-search"
        />
        <CustomSelect
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={[
            { value: "all", label: "All Types" },
            { value: "Contract", label: "Contract" },
            { value: "NDA", label: "NDA" },
            { value: "Lease", label: "Lease" },
            { value: "Privacy Policy", label: "Privacy Policy" },
            { value: "Other", label: "Other" }
          ]}
        />
      </div>

      <div className="record-list">
        {loading ? (
          <p className="record-muted">Opening the archive...</p>
        ) : filteredDocuments.length === 0 ? (
          <p className="record-muted">
            {searchTerm || filterType !== "all"
              ? "No matching case files found."
              : "No case files yet. Present evidence to begin."}
          </p>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="record-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="record-item-main">
                  <h3 className="record-item-title">{doc.title}</h3>
                  <p className="record-meta">
                    {doc.documentType} &bull; {doc.fileType}
                    {doc.fileSize ? ` &bull; ${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                    {" &bull; "}
                    {new Date(doc.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {doc.analyses?.length
                      ? ` &bull; ${doc.analyses.length} analysis${doc.analyses.length > 1 ? "es" : ""}`
                      : ""}
                  </p>
                </div>
                <div className="record-actions">
                  <CustomSelect
                    compact
                    value={doc.folderId || ""}
                    onChange={(e) => {
                      updateDocument(doc.id, { folderId: e.target.value || null });
                      fetchDocuments();
                    }}
                    options={[
                      { value: "", label: "No Folder" },
                      ...folders.map((f) => ({ value: f.id, label: f.name }))
                    ]}
                    style={{ minWidth: "120px" }}
                  />
                  <button onClick={() => handleQuickReAnalyze(doc)} className="record-primary-btn">
                    Reopen
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="record-delete-btn">
                    Delete
                  </button>
                </div>
              </div>

              {/* Expandable content showing both original and AI response */}
              <div style={{ marginTop: "12px" }}>
                <button
                  onClick={() => toggleExpand(doc.id)}
                  className="record-clear-btn"
                  style={{ minHeight: "36px", padding: "6px 14px", fontSize: "0.9rem" }}
                >
                  {expandedId === doc.id ? "▲ HIDE CASE DETAILS" : "▼ SHOW CASE & AI RESPONSE"}
                </button>

                {expandedId === doc.id && (
                  <div style={{ marginTop: "12px", display: "grid", gap: "12px" }}>
                    {/* Original Document */}
                    <div style={{
                      padding: "14px",
                      background: "var(--panel)",
                      border: "1px solid var(--line)",
                      borderLeft: "4px solid var(--cyan)",
                    }}>
                      <div style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: "0.8rem",
                        color: "var(--cyan)",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                        fontWeight: 700,
                      }}>
                        Original Case Text
                      </div>
                      <div style={{
                        color: "var(--muted)",
                        fontSize: "0.85rem",
                        lineHeight: 1.6,
                        maxHeight: "150px",
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                      }}>
                        {formatText(doc.originalText, 500)}
                      </div>
                    </div>

                    {/* AI Analysis Response */}
                    {doc.analyses && doc.analyses.length > 0 ? (
                      <div style={{
                        padding: "14px",
                        background: "var(--panel)",
                        border: "1px solid var(--line)",
                        borderLeft: "4px solid var(--gold)",
                      }}>
                        <div style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "0.8rem",
                          color: "var(--gold)",
                          textTransform: "uppercase",
                          marginBottom: "8px",
                          fontWeight: 700,
                        }}>
                          AI Response
                        </div>
                        <div style={{
                          color: "var(--text)",
                          fontSize: "0.85rem",
                          lineHeight: 1.6,
                          maxHeight: "200px",
                          overflowY: "auto",
                          whiteSpace: "pre-wrap",
                        }}>
                          {formatText(doc.analyses[0].result, 800)}
                        </div>
                        <div style={{
                          marginTop: "8px",
                          display: "flex",
                          gap: "12px",
                          fontSize: "0.75rem",
                          color: "var(--muted)",
                        }}>
                          <span>Prompt: {doc.analyses[0].prompt}</span>
                          {doc.analyses[0].duration && <span>Time: {(doc.analyses[0].duration / 1000).toFixed(1)}s</span>}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: "14px",
                        background: "var(--panel)",
                        border: "1px solid var(--line)",
                        borderLeft: "4px solid var(--muted)",
                        color: "var(--muted)",
                        fontSize: "0.85rem",
                        fontStyle: "italic",
                      }}>
                        No AI analysis available for this case.
                      </div>
                    )}

                    {/* View full in editor */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleQuickReAnalyze(doc)}
                        className="record-primary-btn"
                        style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                      >
                        Edit Original Text
                      </button>
                      {doc.analyses?.length > 0 && (
                        <button
                          onClick={() => handleViewAnalysis(doc)}
                          className="record-clear-btn"
                          style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                        >
                          View Full Analysis
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
