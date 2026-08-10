"use client";

import { useState, useEffect } from "react";
import { getDeadlines } from "../lib/storage";

export default function DeadlineTracker() {
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    setDeadlines(getDeadlines());
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getUrgency = (dateStr) => {
    const date = new Date(dateStr);
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "EXPIRED STATUTE";
    if (diffDays <= 7) return "CRITICAL COUNTDOWN";
    return "ACTIVE STATUTE";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const sortedDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div>
      <div className="record-header">
        <h3 className="record-title" style={{ fontFamily: "var(--font-header)", letterSpacing: "0.5px" }}>
          STATUTE OF LIMITATIONS & DEADLINE CLOCK
        </h3>
        <span className="court-speaker-badge badge-witness" style={{ fontSize: "0.9rem" }}>
          {deadlines.length} DEADLINE{deadlines.length !== 1 ? "S" : ""} DETECTED
        </span>
      </div>

      {sortedDeadlines.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "220px", border: "2px dashed var(--gold)" }}>
          <div className="empty-state-icon" style={{ fontSize: "2.5rem" }}>📅</div>
          <div className="empty-state-title" style={{ fontFamily: "var(--font-action)", fontSize: "1.4rem", letterSpacing: "1px" }}>
            NO PENDING STATUTES DETECTED
          </div>
          <p className="empty-state-desc">
            Present case documents containing contractual dates or statutory deadlines to activate the countdown clock.
          </p>
        </div>
      ) : (
        <div className="deadline-list" style={{ display: "grid", gap: "14px" }}>
          {sortedDeadlines.map((item) => {
            const urgency = getUrgency(item.date);
            const isExpired = urgency === "EXPIRED STATUTE";
            const isCritical = urgency === "CRITICAL COUNTDOWN";

            return (
              <div
                key={item.id}
                style={{
                  padding: "16px 20px",
                  background: "linear-gradient(180deg, #0e1526 0%, #070b15 100%)",
                  border: `3px solid ${isExpired ? "var(--prosecution-red)" : isCritical ? "var(--gold)" : "var(--defense-blue)"}`,
                  boxShadow: "4px 4px 0 #000000",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span
                      className={`court-speaker-badge ${
                        isExpired ? "badge-prosecution" : isCritical ? "badge-witness" : "badge-defense"
                      }`}
                    >
                      {urgency}
                    </span>
                    <span style={{ fontFamily: "var(--font-action)", fontSize: "1.3rem", color: "var(--paper)", letterSpacing: "1px" }}>
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <div style={{ fontFamily: "var(--font-action)", fontSize: "1.1rem", color: "var(--gold)", letterSpacing: "0.5px" }}>
                    📜 {item.documentTitle}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: "240px",
                    padding: "10px 14px",
                    background: "#060a14",
                    border: "1px stroke rgba(255,203,61,0.2)",
                    fontSize: "0.9rem",
                    color: "var(--text)",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "var(--muted)", fontStyle: "italic" }}>Context: </span>
                  "...{item.context.replace(/\n/g, " ").trim()}..."
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
