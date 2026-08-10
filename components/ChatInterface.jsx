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
    if (!confirm("Clear chat history for this document?")) return;
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
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <div className="empty-state-title">Document Chat</div>
            <p className="empty-state-desc">
              Ask questions about this document and get AI-powered answers.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
            <span className="loading-step-text">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this document..."
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>

      {messages.length > 0 && (
        <button
          onClick={handleClear}
          style={{
            marginTop: "10px",
            padding: "6px 12px",
            background: "transparent",
            border: "1px solid var(--line)",
            color: var(--muted)",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Clear Chat
        </button>
      )}
    </div>
  );
}
