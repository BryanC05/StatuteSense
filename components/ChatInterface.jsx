"use client";

import { useState, useRef, useEffect } from "react";
import { getChatHistory, saveChatMessage, deleteChatHistory } from "../lib/storage";

export default function ChatInterface({ documentText, documentId, documentTitle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const history = getChatHistory(documentId);
    setMessages(history);
  }, [documentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (overrideText) => {
    const textToSend = typeof overrideText === "string" ? overrideText : input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: textToSend.trim(),
      documentId,
    };

    saveChatMessage(userMessage);
    setMessages((prev) => [...prev, userMessage]);
    if (typeof overrideText !== "string") setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          documentText: documentText || null,
          history: messages.slice(-10),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMessage = {
          role: "assistant",
          content: data.response,
          documentId,
        };
        saveChatMessage(assistantMessage);
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage = {
          role: "assistant",
          content: `Error: ${data.error || "Failed to get response"}`,
          documentId,
        };
        saveChatMessage(errorMessage);
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage = {
        role: "assistant",
        content: "Error: Failed to connect to AI service.",
        documentId,
      };
      saveChatMessage(errorMessage);
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (!confirm("Clear chat history for this document?")) return;
    deleteChatHistory(documentId);
    setMessages([]);
  };

  return (
    <div className="chat-container">
      {documentTitle && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(29, 112, 245, 0.1)",
          border: "1px solid var(--defense-blue)",
          marginBottom: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--gold)", fontWeight: "bold", fontSize: "0.95rem" }}>Active Document:</span>
            <strong style={{ color: "var(--paper)", fontSize: "1rem" }}>{documentTitle}</strong>
          </div>
          <span className="court-speaker-badge badge-defense" style={{ fontSize: "0.75rem" }}>Loaded</span>
        </div>
      )}

      <div style={{ marginBottom: "12px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--gold)", fontWeight: "600" }}>Quick Actions:</span>
        {[
          "What are the main liability risks in this case?",
          "What real statutes or case law precedents apply?",
          "How can terms be renegotiated to mitigate risk?",
          "Does this scope require a Data Processing Addendum (DPA)?"
        ].map((promptText, idx) => (
          <button
            key={idx}
            type="button"
            className="tab-btn-clean"
            onClick={() => handleSend(promptText)}
            disabled={loading}
            style={{ fontSize: "0.82rem", padding: "4px 10px", minHeight: "30px", textTransform: "none" }}
          >
            💬 {promptText}
          </button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: "2.5rem" }}>💬</div>
            <div className="empty-state-title">
              AI Chat
            </div>
            <p className="empty-state-desc">
              Ask questions about your document, analyze specific clauses, or discuss legal implications.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`court-dialogue-message ${msg.role === "user" ? "court-dialogue-user" : "court-dialogue-assistant"}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span className={`court-speaker-badge ${msg.role === "user" ? "badge-defense" : "badge-witness"}`}>
                {msg.role === "user" ? "You" : "AI Assistant"}
              </span>
            </div>
            <div style={{ fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="court-dialogue-message court-dialogue-assistant" style={{ opacity: 0.85 }}>
            <span className="court-speaker-badge badge-witness">AI Assistant</span>
            <div className="loading-step-text" style={{ fontSize: "0.95rem", color: "var(--gold)" }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: "8px 12px",
        marginBottom: "10px",
        background: "rgba(255, 203, 61, 0.08)",
        border: "1px solid rgba(255, 203, 61, 0.3)",
        fontSize: "0.8rem",
        color: "var(--muted)",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <span>⚠️</span>
        <span>
          <strong style={{ color: "var(--gold)" }}>Note:</strong> AI responses may contain mistakes. Use for reference only and verify facts.
        </span>
      </div>

      <form
        className="chat-input-row"
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
      >
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this document..."
          disabled={loading}
        />
        <button
          type="submit"
          className="run-btn"
          disabled={loading || !input.trim()}
          style={{ minHeight: "52px", padding: "10px 24px", minWidth: "100px" }}
        >
          Send
        </button>
      </form>

      {messages.length > 0 && (
        <div style={{ marginTop: "12px", textAlign: "right" }}>
          <button
            onClick={handleClear}
            className="record-clear-btn"
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
