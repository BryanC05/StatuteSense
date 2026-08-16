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
import JurisdictionSelector from "../components/JurisdictionSelector";
import ContradictionDetector from "../components/ContradictionDetector";
import ClauseRedliner from "../components/ClauseRedliner";
import PlainEnglishTranslator from "../components/PlainEnglishTranslator";
import BatchAnalyzer from "../components/BatchAnalyzer";
import { exportToPDF } from "../lib/pdfExport";
import { saveDocument, saveAnalysis, getAnalyses } from "../lib/storage";
import { useTheme } from "./context/ThemeContext";
import { sanitizeHtml } from "@/lib/sanitize";
import { TASKS, DOCTYPES, LOADING_STEPS, TABS, NAV_GROUPS } from "@/lib/constants";
import { AttorneyBadgeIcon, ScalesIcon, FileIcon, CopyIcon, CheckIcon, CloseIcon, UploadIcon, InfoIcon } from "@/components/Icons";

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
  const [jurisdiction, setJurisdiction] = useState("US Federal");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetch("/api/model")
      .then((r) => r.json())
      .then((data) => setModel(data.model))
      .catch((err) => {
        console.error("Failed to fetch model info:", err);
        setModel("Unknown (API unavailable)");
      });
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

  const handleAskFollowUp = (doc) => {
    const targetDoc = doc || activeDocument || { title: activeDocument?.title || "Current Case Brief", originalText: text };
    setActiveDocument(targetDoc);
    if (targetDoc.originalText) setText(targetDoc.originalText);
    setActiveTab("chat");
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
    formData.append("task", `${task} [Governing Jurisdiction: ${jurisdiction}]`);
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
                  <span className="panel-number">INPUT</span>
                  <h2 className="panel-title">Document Input</h2>
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
 
                 <div className="meta-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                   <div className="field-row">
                     <label className="field-label">Evidence Type</label>
                     <CustomSelect
                       options={DOCTYPES}
                       value={docType}
                       onChange={(e) => setDocType(e.target.value)}
                     />
                   </div>
 
                   <div className="field-row">
                     <label className="field-label">Governing Jurisdiction</label>
                     <JurisdictionSelector
                       value={jurisdiction}
                       onChange={setJurisdiction}
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
                       <span className="loading-spinner-btn">Analyzing...</span>
                     ) : (
                       "Run Analysis"
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
                     Analysis Results
                   </h2>
                   {response && !loading && (
                     <div className="viewer-actions">
                       <button
                         className="record-primary-btn"
                         onClick={() => exportToPDF(activeDocument?.title || "Official Court Brief", marked.parse(response))}
                       >
                         📄 Export PDF
                       </button>
                       <button
                         onClick={() => handleAskFollowUp(activeDocument || { title: activeDocument?.title || "Current Case Brief", originalText: text })}
                         className="record-primary-btn"
                       >
                         💬 Follow-up Chat
                       </button>
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
                     <>
                       <div className="alert" style={{ marginBottom: '16px' }}>
                         <span>ℹ️</span>
                         <span><strong>AI Disclaimer:</strong> This response is AI-generated for reference only. Verify critical details with qualified legal counsel.</span>
                       </div>
                       <div
                         className="markdown-content"
                         dangerouslySetInnerHTML={{ __html: sanitizeHtml(marked.parse(response)) }}
                       />
                       <div style={{
                         marginTop: "24px",
                         padding: "16px 20px",
                         border: "1px solid var(--border)",
                         borderRadius: "6px",
                         display: "flex",
                         justifyContent: "space-between",
                         alignItems: "center",
                         flexWrap: "wrap",
                         gap: "12px"
                       }}>
                         <div>
                           <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                             💬 Follow-up Questions
                           </div>
                           <div style={{ fontSize: "0.88rem", color: "var(--muted)", marginTop: "2px" }}>
                             Ask AI co-counsel further on specific clauses, liabilities, or strategies.
                           </div>
                         </div>
                         <button
                           className="run-btn"
                           onClick={() => handleAskFollowUp(activeDocument || { title: activeDocument?.title || "Current Case Brief", originalText: text })}
                         >
                           Ask Follow-up
                         </button>
                       </div>
 
                       <div style={{ marginTop: "24px" }}>
                         <PlainEnglishTranslator documentText={response || text} />
                       </div>
                     </>
                   ) : (
                     <div className="empty-state">
                       <ScalesIcon className="empty-state-icon" />
                       <div className="empty-state-title">
                         Ready for Analysis
                       </div>
                       <p className="empty-state-desc">
                         Upload or paste a document to get started.
                       </p>
                     </div>
                   )}
                 </div>
               </section>
             </div>
 
             <section id="record" className="history-shell" style={{ marginTop: "30px" }}>
               <DocumentHistory onDocumentSelect={handleDocumentSelect} onInterrogate={handleAskFollowUp} />
             </section>
           </>
         );
      case "chat":
        return (
          <div className="panel">
            <div className="panel-heading">
              <span className="panel-number">CHAT</span>
              <h2 className="panel-title">AI Chat</h2>
            </div>
            <ChatInterface
              documentText={text}
              documentId={activeDocument ? activeDocument.id : "global"}
              documentTitle={activeDocument ? activeDocument.title : "Current Case"}
            />
          </div>
        );
      case "compare":
        return (
          <div className="panel">
            <div className="panel-heading">
              <span className="panel-number">COMPARE</span>
              <h2 className="panel-title">Document Comparison</h2>
            </div>
            <DocumentComparison />
            <div style={{ marginTop: "30px" }}>
              <BatchAnalyzer onDocumentSelect={handleDocumentSelect} />
            </div>
          </div>
        );
      case "risk":
        return (
          <div className="panel">
            <div className="panel-heading">
              <span className="panel-number">RISK</span>
              <h2 className="panel-title">Risk Assessment</h2>
            </div>
            <ContradictionDetector documentText={text} jurisdiction={jurisdiction} />
            <div style={{ marginTop: "24px" }}>
              <RiskAnalyzer documentText={text} />
            </div>
          </div>
        );
      case "compliance":
        return (
          <div className="panel">
            <div className="panel-heading">
              <span className="panel-number">COMPLIANCE</span>
              <h2 className="panel-title">Compliance Analysis</h2>
            </div>
            <ComplianceChecker documentText={text} />
          </div>
        );
      case "clauses":
        return (
          <div className="panel">
            <div className="panel-heading">
              <span className="panel-number">LIBRARY</span>
              <h2 className="panel-title">Clause Library & Redliner</h2>
            </div>
            <ClauseRedliner
              jurisdiction={jurisdiction}
              onInsertRewrite={(rewriteText) => {
                setText((prev) => (prev ? prev + "\n\n" + rewriteText : rewriteText));
                setActiveTab("desk");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            <div style={{ marginTop: "24px" }}>
              <ClauseLibrary
                onInsert={(clauseText) => {
                  setText((prev) => (prev ? prev + "\n\n" + clauseText : clauseText));
                  setActiveTab("desk");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </div>
        );
      case "deadlines":
        return (
          <div className="panel">
            <div className="panel-heading">
              <span className="panel-number">DEADLINES</span>
              <h2 className="panel-title">Deadline Tracker</h2>
            </div>
            <DeadlineTracker />
          </div>
        );
      case "prompts":
        return (
          <div className="panel">
            <div className="panel-heading">
              <span className="panel-number">PROMPTS</span>
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
          <div className="panel">
            <div className="panel-heading">
              <span className="panel-number">ANALYTICS</span>
              <h2 className="panel-title">Analytics Dashboard</h2>
            </div>
            <AnalyticsDashboard />
          </div>
        );
      case "search":
        return (
          <div className="panel">
            <div className="panel-heading">
              <span className="panel-number">SEARCH</span>
              <h2 className="panel-title">Search & Records</h2>
            </div>
            <SearchBar
              onDocumentSelect={handleDocumentSelect}
            />
            <div style={{ marginTop: "30px" }}>
              <DocumentHistory onDocumentSelect={handleDocumentSelect} onInterrogate={handleAskFollowUp} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <ScalesIcon style={{ width: 24, height: 24, color: 'var(--accent)' }} />
          <span className="sidebar-logo">StatuteSense</span>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="sidebar-group">
              <span className="sidebar-group-label">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={toggleTheme} className="sidebar-item" style={{ justifyContent: 'center' }}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '4px' }}>
            {model || 'Loading...'}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="app-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>
              {NAV_GROUPS.flatMap(g => g.items).find(t => t.id === activeTab)?.label || 'Document Analysis'}
            </h1>
            {activeDocument && (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Active: {activeDocument.title}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {activeDocument && (
              <button onClick={() => { setActiveDocument(null); setText(''); setResponse(''); }} className="clear-btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Clear Document
              </button>
            )}
          </div>
        </header>

        <div className="dashboard-container">
          <div className="tab-content-wrapper" key={activeTab}>
            {renderTabContent()}
          </div>
          <footer className="dashboard-footer">
            <p>AI-generated analysis is for reference purposes only and does not constitute formal legal advice.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
