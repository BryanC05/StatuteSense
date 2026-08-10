"use client";

import { useState, useEffect } from "react";
import { marked } from "marked";
import DocumentHistory from "../components/DocumentHistory";
import { saveDocument, saveAnalysis } from "../lib/storage";

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

const TrashIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

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

  return (
    <>
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-badge">SS</span>
          <div>
            <span className="header-logo-text">StatuteSense</span>
            <span className="header-logo-kicker">Court Record AI</span>
          </div>
        </div>
        <nav className="case-menu" aria-label="Primary case menu">
          <a className="case-menu-link active" href="#case-file">Case File</a>
          <a className="case-menu-link" href="#testimony">Testimony</a>
          <a className="case-menu-link" href="#record">Record</a>
        </nav>
        <div className="user-block">
          <div className="user-info">
            <span className="user-label">Local Bench</span>
            <span className="user-name">History saved on device</span>
          </div>
        </div>
      </header>

      <main className="dashboard-container">
        <section className="court-hero" aria-labelledby="case-title">
          <div className="court-hero-copy">
            <span className="case-stamp">New Evidence</span>
            <h1 id="case-title">Build the argument before the clock strikes.</h1>
            <p>
              Feed StatuteSense a document and get a structured brief with clauses,
              risks, obligations, and next moves ready for review.
            </p>
          </div>
          <div className="court-hero-meter" aria-label="Case readiness">
            <span>Case Readiness</span>
            <strong>Standby</strong>
          </div>
        </section>

        <div className="dashboard-grid">
          <form id="case-file" className="panel editor-panel" onSubmit={handleSubmit}>
            <div className="panel-heading">
              <span className="panel-number">01</span>
              <h2 className="panel-title">Case File</h2>
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
                <select className="select-input" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  {DOCTYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-row">
                <label className="field-label">Cross-Examination</label>
                <select className="select-input" value={task} onChange={(e) => setTask(e.target.value)}>
                  {TASKS.map((taskOption) => (
                    <option key={taskOption} value={taskOption}>
                      {taskOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="btn-group">
              <button type="submit" className="run-btn" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner-btn">Pressing the Record...</span>
                ) : (
                  "Start Cross-Examination"
                )}
              </button>
              <button type="button" className="clear-btn" onClick={handleClear} disabled={loading}>
                Clear
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

          <section id="testimony" className="panel viewer-panel">
            <div className="viewer-header">
              <h2 className="viewer-title">
                <ScalesIcon className="panel-title-icon" />
                Testimony Board
              </h2>
              {response && !loading && (
                <div className="viewer-actions">
                  <button
                    className={`action-icon-btn ${copied ? "success" : ""}`}
                    onClick={handleCopy}
                    title={copied ? "Copied" : "Copy to Clipboard"}
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
                  <div className="loading-step-text">
                    {LOADING_STEPS[loadingStep]}
                  </div>
                </div>
              ) : response ? (
                <div
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ __html: marked.parse(response) }}
                />
              ) : (
                <div className="empty-state">
                  <ScalesIcon className="empty-state-icon" />
                  <div className="empty-state-title">The bench is waiting.</div>
                  <p className="empty-state-desc">
                    Submit testimony or evidence to produce a structured legal brief.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <section id="record" className="history-shell">
          <DocumentHistory onDocumentSelect={(doc) => {
            setText(doc.text);
            setDocType(doc.type);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }} />
        </section>

        <footer className="dashboard-footer">
          <p>
            Disclaimer: AI-generated analysis is not 100% accurate. Results are for shallow reference purposes only and do not constitute formal legal advice. Please consult with a qualified legal professional to verify critical details.
          </p>
        </footer>
      </main>
    </>
  );
}
