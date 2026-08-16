"use client";

import { useState, useEffect, useMemo } from "react";
import { getDeadlines } from "../lib/storage";

export default function DeadlineTracker() {
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    setDeadlines(getDeadlines());
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

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

  const sortedDeadlines = useMemo(() => [...deadlines].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  ), [deadlines]);

  return (
    <div>
      <div className="record-header">
        <h3 className="record-title">
          STATUTE OF LIMITATIONS & DEADLINE CLOCK
        </h3>
        <span className="court-speaker-badge badge-witness">
          {deadlines.length} DEADLINE{deadlines.length !== 1 ? "S" : ""} DETECTED
        </span>
      </div>

      {sortedDeadlines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">
            NO PENDING STATUTES DETECTED
          </div>
          <p className="empty-state-desc">
            Present case documents containing contractual dates or statutory deadlines to activate the countdown clock.
          </p>
        </div>
      ) : (
        <div className="deadline-list">
          {sortedDeadlines.map((item) => {
            const urgency = getUrgency(item.date);
            const isExpired = urgency === "EXPIRED STATUTE";
            const isCritical = urgency === "CRITICAL COUNTDOWN";
            const urgencyClass = isExpired ? "past" : isCritical ? "urgent" : "upcoming";

            return (
              <div
                key={item.id}
                className={`deadline-item ${urgencyClass}`}
              >
                <div>
                  <div className="record-actions">
                    <span
                      className={`court-speaker-badge ${
                        isExpired ? "badge-prosecution" : isCritical ? "badge-witness" : "badge-defense"
                      }`}
                    >
                      {urgency}
                    </span>
                    <span className="deadline-date">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <div className="field-label">
                    📜 {item.documentTitle}
                  </div>
                </div>

                <div className="deadline-context">
                  <span>Context: </span>
                  &ldquo;{item.context.replace(/\n/g, " ").trim()}&rdquo;
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
