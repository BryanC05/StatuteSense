"use client";

import { useState, useEffect } from "react";
import { marked } from "marked";
import DocumentHistory from "../components/DocumentHistory";
import ChatInterface from "../components/ChatInterface";
import DocumentComparison from "../components/DocumentComparison";
import ComplianceChecker from "../components/ComplianceChecker";
import RiskAnalyzer from "../components/RiskAnalyzer";
import ClauseLibrary from "../components/ClauseLibrary";
import DeadlineTracker from "../components/DeadlineTracker";
import CustomPromptManager from "../components/CustomPromptManager";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import SearchBar from "../components/SearchBar";
import CustomSelect from "../components/CustomSelect";
import { saveDocument, saveAnalysis, getAnalyses } from "../lib/storage";
import { useTheme } from "./context/ThemeContext";

const TASKS = [
  "Summarize the document and highlight key clauses.",
  "Extract obligations and deadlines.",
  "Identify risk areas and provide advice.",
  "Compare this document to a standard contract.",
];

const DOCTYPES = ["Contract", "NDA", "Lease", "Privacy Policy", "Other"];

const LOADING_STEPS = [
  "Opening the case file...",
  "Cross-checking clauses and entities...",
  "Pressing weak points for risk signals...",
  "Mapping obligations, deadlines, and duties...",
  "Preparing the final court record...",
];

const AttorneyBadgeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#badgeGold)" stroke="#ffffff" strokeWidth="1" />
    <circle cx="12" cy="12" r="4" fill="#1d70f5" stroke="#ffffff" strokeWidth="1" />
    <defs>
      <linearGradient id="badgeGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffea75" />
        <stop offset="50%" stopColor="#ffcb3d" />
        <stop offset="100%" stopColor="#c78c00" />
      </linearGradient>
    </defs>
  </svg>
);

const ScalesIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="12" y1="21" x2="16" y2="21" />
    <line x1="12" y1="21" x2="8" y2="21" />
    <line x1="12" y1="7" x2="4" y2="10" />
    <line x1="12" y1="7" x2="20" y2="10" />
    <path d="M4 10l-2 5h4l-2 -5" />
    <path d="M20 10l-2 5h4l-2 -5" />
    <line x1="4" y1="15" x2="4" y2="20" />
    <line x1="20" y1="15" x2="20" y2="20" />
  </svg>
);

const FileIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const CopyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const InfoIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const TABS = [
  { id: "desk", label: "Defense Desk", icon: "⚖️" },
  { id: "chat", label: "Cross-Examination", icon: "💬" },
  { id: "compare", label: "Evidence Comparison", icon: "🔍" },
  { id: "risk", label: "Risk Radar", icon: "🛡️" },
  { id: "compliance", label: "Verdict Verification", icon: "✅" },
  { id: "clauses", label: "Precedent Library", icon: "📖" },
  { id: "deadlines", label: "Statute Clock", icon: "📅" },
  { id: "prompts", label: "Court Directives", icon: "🛠️" },
  { id: "analytics", label: "Trial Analytics", icon: "📊" },
  { id: "search", label: "Evidence Vault", icon: "📂" },
];

export default function HomePage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [task, setTask] = useState(TASKS[0]);
  const [docType, setDocType] = useState(DOCTYPES[0]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState("paste");
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState("");
  const [model, setModel] = useState("");
  const [activeTab, setActiveTab] = useState("desk");
  const [activeDocument, setActiveDocument] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetch("/api/model")
      .then((r) => r.json())
      .then((data) => setModel(data.model))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
    setFile(null);
    setResponse("");
    setError("");
    setSaveStatus("");
    setActiveDocument(null);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const ext = droppedFile.name.split(".").pop().toLowerCase();
      if (ext === "pdf" || ext === "txt") {
        setFile(droppedFile);
      } else {
        setError("Only PDF or TXT files are accepted.");
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDocumentSelect = (doc) => {
    setActiveDocument(doc);
    setText(doc.originalText || doc.text || "");
    setDocType(doc.documentType || doc.type || "Other");
    
    setResponse("");
    if (doc.id) {
      const docAnalyses = getAnalyses(doc.id);
      if (docAnalyses && docAnalyses.length > 0) {
        setResponse(docAnalyses[0].result);
      }
    }
    setActiveTab("desk");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResponse("");
    setSaveStatus("");

    if (inputMode === "paste" && !text.trim()) {
      setError("Please paste some document text before running analysis.");
      return;
    }
    if (inputMode === "upload" && !file) {
      setError("Please upload a PDF or text file before running analysis.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    if (inputMode === "upload" && file) {
      formData.append("document", file);
    } else {
      formData.append("text", text);
    }
    formData.append("task", task);
    formData.append("docType", docType);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Unable to analyze document.");
      } else {
        setResponse(data.output || "No response returned.");

        if (data.document && data.metadata) {
          const savedDoc = saveDocument(data.document);
          saveAnalysis({
            documentId: savedDoc.id,
            prompt: task,
            result: data.output,
            modelUsed: data.metadata.modelUsed,
            duration: data.metadata.duration,
          });
          setSaveStatus("Analysis saved to local history");
          setActiveDocument(savedDoc);
        }
      }
    } catch (err) {
      setError("Unable to connect to the AI server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = inputMode === "paste" ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  const renderTabContent = () => {
    switch (activeTab) {
      case "desk":
        return (
          <>
            <div className="dashboard-grid">
              <form id="case-file" className="panel editor-panel" onSubmit={handleSubmit}>
                <div className="panel-heading">
                  <span className="panel-number">EXHIBIT A</span>
                  <h2 className="panel-title">COURT EVIDENCE DOSSIER</h2>
                </div>

                <div className="tab-bar">
                  <button
                    type="button"
                    className={`tab-btn ${inputMode === "paste" ? "active" : ""}`}
                    onClick={() => setInputMode("paste")}
                  >
                    Testimony
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${inputMode === "upload" ? "active" : ""}`}
                    onClick={() => setInputMode("upload")}
                  >
                    Evidence
                  </button>
                </div>

                {inputMode === "paste" ? (
                  <div className="field-group">
                    <textarea
                      className="editor-textarea"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste the contract, policy, or clause bundle here..."
                    />
                    {text && (
                      <div className="editor-stats">
                        <span>{wordCount} words</span>
                        <span>~{estimatedReadingTime} min read</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="field-group">
                    <label
                      htmlFor="file-upload"
                      className={`dropzone ${isDragOver ? "dragover" : ""} ${file ? "has-file" : ""}`}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                    >
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.txt"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                      {file ? (
                        <>
                          <FileIcon className="dropzone-icon active" />
                          <div className="file-info-box">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            className="remove-file-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFile(null);
                            }}
                          >
                            <CloseIcon className="remove-icon" />
                          </button>
                        </>
                      ) : (
                        <>
                          <UploadIcon className="dropzone-icon" />
                          <div className="dropzone-text">
                            <span className="highlight">Present evidence</span> or drag & drop
                          </div>
                          <span className="dropzone-sub">PDF or Plain Text (up to 10MB)</span>
                        </>
                      )}
                    </label>
                  </div>
                )}

                <div className="meta-grid">
                  <div className="field-row">
                    <label className="field-label">Evidence Type</label>
                    <CustomSelect
                      options={DOCTYPES}
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                    />
                  </div>

                  <div className="field-row">
                    <label className="field-label">Preset Task</label>
                    <CustomSelect
                      options={[
                        ...TASKS.map((t) => ({ value: t, label: t })),
                        { value: "custom", label: "Custom Directive" }
                      ]}
                      value={TASKS.includes(task) ? task : "custom"}
                      onChange={(e) => {
                        if (e.target.value !== "custom") {
                          setTask(e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="field-group" style={{ marginTop: "15px" }}>
                  <label className="field-label">Analysis Directive (Prompt)</label>
                  <textarea
                    className="editor-textarea"
                    style={{ minHeight: "80px" }}
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Specify what the AI should analyze or ask..."
                  />
                </div>

                <div className="btn-group">
                  <button type="submit" className="run-btn" disabled={loading}>
                    {loading ? (
                      <span className="loading-spinner-btn">PRESSING THE RECORD...</span>
                    ) : (
                      "CROSS-EXAMINE EVIDENCE"
                    )}
                  </button>
                  <button type="button" className="clear-btn" onClick={handleClear} disabled={loading}>
                    CLEAR RECORD
                  </button>
                </div>

                {error && (
                  <div className="alert error">
                    <InfoIcon className="alert-icon" />
                    <span>{error}</span>
                  </div>
                )}

                {saveStatus && (
                  <div className="alert success">
                    <CheckIcon className="alert-icon" />
                    <span>{saveStatus}</span>
                  </div>
                )}
              </form>

              <section id="testimony" className="panel viewer-panel" style={{ border: "3px solid var(--gold)", boxShadow: "6px 6px 0 #000000" }}>
                <div className="viewer-header">
                  <h2 className="viewer-title" style={{ fontFamily: "var(--font-header)", letterSpacing: "0.5px" }}>
                    <ScalesIcon className="panel-title-icon" style={{ color: "var(--gold)" }} />
                    OFFICIAL COURT BRIEF & RECORD
                  </h2>
                  {response && !loading && (
                    <div className="viewer-actions">
                      <button
                        className={`action-icon-btn ${copied ? "success" : ""}`}
                        onClick={handleCopy}
                        title={copied ? "Copied" : "Copy to Clipboard"}
                        style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
                      >
                        {copied ? <CheckIcon className="action-icon" /> : <CopyIcon className="action-icon" />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="viewer-scroll-container">
                  {loading ? (
                    <div className="skeleton-loader">
                      <div className="skeleton-line h"></div>
                      <div className="skeleton-line p1"></div>
                      <div className="skeleton-line p2"></div>
                      <div className="skeleton-line p3"></div>
                      <div className="skeleton-line p1"></div>
                      <div className="skeleton-line p2"></div>
                      <div className="skeleton-line p4"></div>
                      <div className="loading-step-text" style={{ fontFamily: "var(--font-action)", fontSize: "1.2rem", color: "var(--gold)", letterSpacing: "1px" }}>
                        {LOADING_STEPS[loadingStep]}
                      </div>
                    </div>
                  ) : response ? (
                    <div
                      className="markdown-content"
                      dangerouslySetInnerHTML={{ __html: marked.parse(response) }}
                    />
                  ) : (
                    <div className="empty-state" style={{ border: "2px dashed var(--gold)", minHeight: "380px" }}>
                      <ScalesIcon className="empty-state-icon" style={{ color: "var(--gold)", width: "64px", height: "64px" }} />
                      <div className="empty-state-title" style={{ fontFamily: "var(--font-action)", fontSize: "1.5rem", letterSpacing: "1px", color: "var(--paper)" }}>
                        THE JUDGE'S BENCH IS WAITING.
                      </div>
                      <p className="empty-state-desc" style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
                        Present witness testimony or evidence files to generate an unassailable legal brief.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section id="record" className="history-shell" style={{ marginTop: "30px" }}>
              <DocumentHistory onDocumentSelect={handleDocumentSelect} />
            </section>
          </>
        );
      case "chat":
        return (
          <div className="panel" style={{ padding: "24px" }}>
            <div className="panel-heading" style={{ marginBottom: "20px" }}>
              <span className="panel-number">💬</span>
              <h2 className="panel-title">Interactive Chat</h2>
            </div>
            <ChatInterface
              documentText={text}
              documentId={activeDocument ? activeDocument.id : "global"}
            />
          </div>
        );
      case "compare":
        return (
          <div className="panel" style={{ padding: "24px" }}>
            <div className="panel-heading" style={{ marginBottom: "20px" }}>
              <span className="panel-number">🔍</span>
              <h2 className="panel-title">Document Comparison</h2>
            </div>
            <DocumentComparison />
          </div>
        );
      case "risk":
        return (
          <div className="panel" style={{ padding: "24px" }}>
            <div className="panel-heading" style={{ marginBottom: "20px" }}>
              <span className="panel-number">🛡️</span>
              <h2 className="panel-title">Risk Assessment</h2>
            </div>
            <RiskAnalyzer documentText={text} />
          </div>
        );
      case "compliance":
        return (
          <div className="panel" style={{ padding: "24px" }}>
            <div className="panel-heading" style={{ marginBottom: "20px" }}>
              <span className="panel-number">✅</span>
              <h2 className="panel-title">Compliance Verification</h2>
            </div>
            <ComplianceChecker documentText={text} />
          </div>
        );
      case "clauses":
        return (
          <div className="panel" style={{ padding: "24px" }}>
            <div className="panel-heading" style={{ marginBottom: "20px" }}>
              <span className="panel-number">📖</span>
              <h2 className="panel-title">Clause Library</h2>
            </div>
            <ClauseLibrary
              onInsert={(clauseText) => {
                setText((prev) => (prev ? prev + "\n\n" + clauseText : clauseText));
                setActiveTab("desk");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        );
      case "deadlines":
        return (
          <div className="panel" style={{ padding: "24px" }}>
            <div className="panel-heading" style={{ marginBottom: "20px" }}>
              <span className="panel-number">📅</span>
              <h2 className="panel-title">Deadline Tracker</h2>
            </div>
            <DeadlineTracker />
          </div>
        );
      case "prompts":
        return (
          <div className="panel" style={{ padding: "24px" }}>
            <div className="panel-heading" style={{ marginBottom: "20px" }}>
              <span className="panel-number">🛠️</span>
              <h2 className="panel-title">Custom Prompts</h2>
            </div>
            <CustomPromptManager
              onSelectPrompt={(promptText) => {
                setTask(promptText);
                setActiveTab("desk");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        );
      case "analytics":
        return (
          <div className="panel" style={{ padding: "24px" }}>
            <div className="panel-heading" style={{ marginBottom: "20px" }}>
              <span className="panel-number">📊</span>
              <h2 className="panel-title">Analytics Dashboard</h2>
            </div>
            <AnalyticsDashboard />
          </div>
        );
      case "search":
        return (
          <div className="panel" style={{ padding: "24px" }}>
            <div className="panel-heading" style={{ marginBottom: "20px" }}>
              <span className="panel-number">📂</span>
              <h2 className="panel-title">Explorer & Search</h2>
            </div>
            <SearchBar
              onDocumentSelect={handleDocumentSelect}
            />
            <div style={{ marginTop: "30px" }}>
              <DocumentHistory onDocumentSelect={handleDocumentSelect} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-brand">
          <AttorneyBadgeIcon className="header-logo-icon" style={{ width: "32px", height: "32px", filter: "drop-shadow(0 0 6px rgba(255, 203, 61, 0.6))" }} />
          <ScalesIcon className="header-logo-icon" />
          <span className="header-logo-text" style={{ fontFamily: "var(--font-header)", letterSpacing: "1px" }}>StatuteSense</span>
          <span className="court-session-chip" style={{
            padding: "3px 8px",
            fontSize: "0.7rem",
            fontFamily: "var(--font-action)",
            letterSpacing: "1px",
            background: "linear-gradient(135deg, var(--prosecution-red), var(--prosecution-red-dark))",
            color: "#ffffff",
            border: "1px solid var(--gold)",
            boxShadow: "2px 2px 0 #000000",
            textTransform: "uppercase",
            marginLeft: "6px"
          }}>
            SESSION ACTIVE
          </span>
        </div>
        <div className="user-block" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button
            onClick={toggleTheme}
            className="clear-btn"
            style={{
              padding: "6px 12px",
              minHeight: "34px",
              fontSize: "0.85rem",
              background: "transparent",
              border: "1px solid var(--line)",
              color: "var(--muted)",
              cursor: "pointer",
            }}
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <div className="user-info">
            <span className="user-label">AI Counsel Engine</span>
            <span className="user-name">{model || "Loading..."}</span>
          </div>
        </div>
      </header>

      <main className="dashboard-container">
        <section className="court-hero" aria-labelledby="case-title" style={{
          position: "relative",
          overflow: "hidden",
          border: "3px solid var(--gold)",
          boxShadow: "6px 6px 0 #000000, 0 0 24px rgba(255, 203, 61, 0.2)",
          background: "linear-gradient(135deg, rgba(29, 112, 245, 0.25) 0%, rgba(13, 20, 37, 0.95) 60%, rgba(224, 27, 36, 0.25) 100%)"
        }}>
          <div className="court-hero-copy">
            <span className="court-evidence-stamp">COURT RECORD DOSSIER</span>
            <h1 id="case-title" style={{ fontFamily: "var(--font-header)", letterSpacing: "0.5px", textShadow: "3px 3px 0 #000000" }}>
              BUILD THE DEFENSE BEFORE THE GAVEL FALLS.
            </h1>
            <p style={{ fontSize: "1.02rem", color: "var(--text)" }}>
              Cross-examine legal evidence, analyze critical clauses, expose high-risk traps, and assemble an unassailable court record.
            </p>
          </div>
          <div className="court-hero-meter" aria-label="Case readiness" style={{
            border: "2px solid var(--gold)",
            background: "linear-gradient(180deg, #111a2e, #070b15)",
            boxShadow: "3px 3px 0 #000000",
            padding: "12px 18px",
            textAlign: "center"
          }}>
            <span style={{ fontFamily: "var(--font-action)", fontSize: "1.1rem", color: "var(--gold)", letterSpacing: "1px" }}>CASE READINESS</span>
            <strong style={{ display: "block", fontSize: "1.4rem", color: activeDocument ? "var(--green)" : "var(--gold)", fontFamily: "var(--font-action)", letterSpacing: "1.5px" }}>
              {activeDocument ? "ARMED FOR COURT" : "STANDBY AT DESK"}
            </strong>
          </div>
        </section>

        {activeDocument && (
          <div className="active-doc-banner" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            background: "linear-gradient(90deg, rgba(244, 192, 79, 0.15), rgba(244, 192, 79, 0.05))",
            border: "1px solid var(--gold)",
            marginBottom: "20px",
            borderRadius: "6px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--gold)", fontWeight: "bold" }}>⚖️ Loaded Document:</span>
              <strong style={{ color: "var(--text)" }}>{activeDocument.title}</strong>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>({activeDocument.documentType})</span>
            </div>
            <button
              onClick={() => {
                setActiveDocument(null);
                setText("");
                setResponse("");
              }}
              className="record-clear-btn"
              style={{ padding: "4px 10px", fontSize: "0.75rem", minHeight: "28px" }}
            >
              Unload
            </button>
          </div>
        )}

        <nav className="tab-bar" style={{ marginBottom: "24px", flexWrap: "wrap" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {renderTabContent()}

        <footer className="dashboard-footer">
          <p>
            Disclaimer: AI-generated analysis is not 100% accurate. Results are for shallow reference purposes only and do not constitute formal legal advice. Please consult with a qualified legal professional to verify critical details.
          </p>
        </footer>
      </main>
    </>
  );
}
