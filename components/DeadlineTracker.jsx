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
    if (diffDays < 0) return "past";
    if (diffDays <= 7) return "urgent";
    return "upcoming";
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
        <h3 className="record-title">Deadline Tracker</h3>
        <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          {deadlines.length} deadline{deadlines.length !== 1 ? "s" : ""} detected
        </span>
      </div>

      {sortedDeadlines.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "200px" }}>
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">No Deadlines Detected</div>
          <p className="empty-state-desc">
            Upload documents with dates to automatically track deadlines.
          </p>
        </div>
      ) : (
        <div className="deadline-list">
          {sortedDeadlines.map((item) => {
            const urgency = getUrgency(item.date);
            return (
              <div key={item.id} className={`deadline-item ${urgency}`}>
                <div>
                  <div className="deadline-date">{formatDate(item.date)}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                    {item.documentTitle}
                  </div>
                </div>
                <div className="deadline-context">
                  ...{item.context.replace(/\n/g, " ").trim()}...
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
