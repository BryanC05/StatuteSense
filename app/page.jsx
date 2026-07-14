"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const TASKS = [
  "Summarize the document and highlight key clauses.",
  "Extract obligations and deadlines.",
  "Identify risk areas and provide advice.",
  "Compare this document to a standard contract.",
];

const DOCTYPES = ["Contract", "NDA", "Lease", "Privacy Policy", "Other"];

export default function HomePage() {
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [task, setTask] = useState(TASKS[0]);
  const [docType, setDocType] = useState(DOCTYPES[0]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    const formData = new FormData();
    if (file) {
      formData.append("document", file);
    }
    formData.append("text", text);
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
      <main className="app-shell">
        <div className="hero-card">
          <h1>LegalAssist</h1>
          <p>Loading session…</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="app-shell">
        <section className="hero-card">
          <h1>LegalAssist</h1>
          <p>Sign in to analyze legal documents, upload PDFs, and access secure AI-powered advice.</p>
        </section>

        <section className="tool-card">
          <button className="primary-button" onClick={() => signIn()}>
            Sign in
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-header">
          <div>
            <h1>LegalAssist</h1>
            <p>Analyze legal documents, summarize clauses, and get AI-generated legal guidance.</p>
          </div>
          <div className="user-block">
            <span>Signed in as {session.user?.name || session.user?.email}</span>
            <button className="secondary-button" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
        </div>
      </section>

      <form className="tool-card" onSubmit={handleSubmit}>
        <div className="field-row">
          <label>Document type</label>
          <select value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOCTYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <label>Task</label>
          <select value={task} onChange={(e) => setTask(e.target.value)}>
            {TASKS.map((taskOption) => (
              <option key={taskOption} value={taskOption}>
                {taskOption}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <label>Paste document text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste contract text here or upload a PDF or text file"
            rows="10"
          />
        </div>

        <div className="field-row file-field">
          <label>Upload PDF or text file</label>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Analyzing…" : "Analyze Document"}
        </button>

        {error && <div className="alert error">{error}</div>}
      </form>

      <section className="results-card">
        <h2>AI Output</h2>
        <pre>{response || "Submit a document to see the analysis."}</pre>
      </section>
    </main>
  );
}
