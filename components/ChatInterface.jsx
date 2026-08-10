"use client";

import { useState, useRef, useEffect } from "react";
import { getChatHistory, saveChatMessage, deleteChatHistory } from "../lib/storage";

export default function ChatInterface({ documentText, documentId }) {
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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      documentId,
    };

    saveChatMessage(userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
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
    if (!confirm("Clear courtroom cross-examination history for this document?")) return;
    deleteChatHistory(documentId);
    setMessages([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container" style={{ position: "relative" }}>
      <div className="chat-messages" style={{ minHeight: "360px", maxHeight: "550px", overflowY: "auto", paddingRight: "8px" }}>
        {messages.length === 0 && (
          <div className="empty-state" style={{ border: "2px dashed var(--gold)" }}>
            <div className="empty-state-icon" style={{ fontSize: "2.5rem" }}>⚖️</div>
            <div className="empty-state-title" style={{ fontFamily: "var(--font-action)", fontSize: "1.4rem", letterSpacing: "1px" }}>
              CROSS-EXAMINATION CHAMBER
            </div>
            <p className="empty-state-desc">
              Interrogate the record, question clauses, and request precise legal analysis from AI co-counsel.
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
                {msg.role === "user" ? "🛡️ DEFENSE COUNSEL" : "📜 AI CO-COUNSEL"}
              </span>
            </div>
            <div style={{ fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="court-dialogue-message court-dialogue-assistant" style={{ opacity: 0.85 }}>
            <span className="court-speaker-badge badge-witness">📜 AI CO-COUNSEL</span>
            <div className="loading-step-text" style={{ fontFamily: "var(--font-action)", fontSize: "1.1rem", letterSpacing: "1px", color: "var(--gold)" }}>
              PRESSING WITNESS & ANALYZING EVIDENCE...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row" style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Present question or directive to co-counsel..."
          disabled={loading}
          style={{ flex: 1, minHeight: "52px", fontSize: "0.95rem" }}
        />
        <button
          className="run-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{ minHeight: "52px", padding: "10px 24px", minWidth: "140px" }}
        >
          INTERROGATE
        </button>
      </div>

      {messages.length > 0 && (
        <div style={{ marginTop: "12px", textAlign: "right" }}>
          <button
            onClick={handleClear}
            className="record-clear-btn"
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
          >
            Clear Record
          </button>
        </div>
      )}
    </div>
  );
}
