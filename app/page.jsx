"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { marked } from "marked";

const TASKS = [
  "Summarize the document and highlight key clauses.",
  "Extract obligations and deadlines.",
  "Identify risk areas and provide advice.",
  "Compare this document to a standard contract.",
];

const DOCTYPES = ["Contract", "NDA", "Lease", "Privacy Policy", "Other"];

const LOADING_STEPS = [
  "Ingesting legal text data...",
  "Running legal entity NLP parsing...",
  "Checking for risk clauses & potential liabilities...",
  "Generating summaries & obligations map...",
  "Formatting final legal brief...",
];

// Inline Lucide-style SVG Components
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

const LogoutIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
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

export default function HomePage() {
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [task, setTask] = useState(TASKS[0]);
  const [docType, setDocType] = useState(DOCTYPES[0]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState("paste"); // "paste" or "upload"
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // loading step step carousel
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
      }
    } catch (err) {
      setError("Unable to connect to the AI server. Make sure you are signed in and the API route is available.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="loading-screen">
        <div className="loading-logo-box">
          <ScalesIcon className="spinner-scales" />
          <div className="loading-text">Authenticating Portal…</div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="signin-container">
        <section className="signin-card panel">
          <ScalesIcon className="signin-icon" />
          <h1 className="signin-logo">LEGALASSIST</h1>
          <p className="signin-subtitle">
            Secure, state-of-the-art AI-powered document review, clause extraction, and contract risk analysis.
          </p>
          <button className="run-btn signin-btn" onClick={() => signIn()}>
            Enter Secure Portal
          </button>
        </section>
      </main>
    );
  }

  // Dashboard Header stats info
  const wordCount = inputMode === "paste" ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      <header className="app-header">
        <div className="header-brand">
          <ScalesIcon className="header-logo-icon" />
          <span className="header-logo-text">LEGALASSIST</span>
        </div>
        <div className="user-block">
          <div className="user-info">
            <span className="user-label">Portal Operator</span>
            <span className="user-name">{session.user?.name || session.user?.email}</span>
          </div>
          <button className="signout-btn" onClick={() => signOut()} title="Sign Out">
            <LogoutIcon className="signout-icon" />
          </button>
        </div>
      </header>

      <main className="dashboard-container">
        <div className="dashboard-grid">
          {/* Editor & Control Column */}
          <form className="panel editor-panel" onSubmit={handleSubmit}>
            <h2 className="panel-title">Document Source</h2>
            
            <div className="tab-bar">
              <button
                type="button"
                className={`tab-btn ${inputMode === "paste" ? "active" : ""}`}
                onClick={() => setInputMode("paste")}
              >
                Paste Text
              </button>
              <button
                type="button"
                className={`tab-btn ${inputMode === "upload" ? "active" : ""}`}
                onClick={() => setInputMode("upload")}
              >
                Upload File
              </button>
            </div>

            {inputMode === "paste" ? (
              <div className="field-group">
                <textarea
                  className="editor-textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your legal document, contract, or NDA clauses here..."
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
                        <span className="highlight">Click to upload</span> or drag & drop
                      </div>
                      <span className="dropzone-sub">PDF or Plain Text (up to 10MB)</span>
                    </>
                  )}
                </label>
              </div>
            )}

            <div className="meta-grid">
              <div className="field-row">
                <label className="field-label">Document Classification</label>
                <select className="select-input" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  {DOCTYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-row">
                <label className="field-label">Analysis Objective</label>
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
                  <span className="loading-spinner-btn">Analyzing Document…</span>
                ) : (
                  "Execute Legal Analysis"
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
          </form>

          {/* AI Output Viewer Column */}
          <section className="panel viewer-panel">
            <div className="viewer-header">
              <h2 className="viewer-title">
                <ScalesIcon className="panel-title-icon" />
                Analysis Output
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
                  <div className="empty-state-title">Awaiting Document Ingestion</div>
                  <p className="empty-state-desc">
                    Paste legal text or upload a PDF/TXT contract to generate a comprehensive, structured compliance report.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="dashboard-footer">
          <p>
            Disclaimer: AI-generated analysis is not 100% accurate. Results are for shallow reference purposes only and do not constitute formal legal advice. Please consult with a qualified legal professional to verify critical details.
          </p>
        </footer>
      </main>
    </>
  );
}
