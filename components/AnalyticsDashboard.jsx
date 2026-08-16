'use client';

import { useState, useEffect } from 'react';
import { getDocuments, getAnalyses } from '../lib/storage';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalAnalyses: 0,
    documentsByType: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    try {
      const documents = getDocuments();
      const analyses = getAnalyses();

      const byType = {};
      documents.forEach(doc => {
        byType[doc.documentType] = (byType[doc.documentType] || 0) + 1;
      });

      const docMap = {};
      documents.forEach((d) => { docMap[d.id] = d; });

      setStats({
        totalDocuments: documents.length,
        totalAnalyses: analyses.length,
        documentsByType: Object.entries(byType).map(([type, count]) => ({ type, count })),
        recentActivity: analyses.slice(0, 5).map(a => ({
          ...a,
          documentTitle: docMap[a.documentId]?.title || 'Unknown Record',
        })),
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <p className="record-muted">LOADING TRIAL ANALYTICS RECORD...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="record-header">
        <h2 className="record-title">
          TRIAL & EVIDENCE ANALYTICS
        </h2>
      </div>

      <div className="compare-container">
        <div className="compliance-score">
          <div className="compliance-score-number" style={{ color: 'var(--gold)' }}>
            {stats.totalDocuments}
          </div>
          <div className="record-muted">
            TOTAL COURT EVIDENCE
          </div>
        </div>

        <div className="compliance-score">
          <div className="compliance-score-number" style={{ color: 'var(--cyan)' }}>
            {stats.totalAnalyses}
          </div>
          <div className="record-muted">
            CROSS-EXAMINATIONS
          </div>
        </div>

        <div className="compliance-score">
          <div className="compliance-score-number" style={{ color: 'var(--red)' }}>
            {stats.totalDocuments > 0 ? (stats.totalAnalyses / stats.totalDocuments).toFixed(1) : '0'}
          </div>
          <div className="record-muted">
            AVG DIRECTIVES PER CASE
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 className="panel-title">
          EVIDENCE CLASSIFICATION BREAKDOWN
        </h3>
        {stats.documentsByType.length === 0 ? (
          <p className="record-muted">No case evidence files registered.</p>
        ) : (
          <div className="compare-container">
            {stats.documentsByType.map(({ type, count }) => {
              const percentage = Math.round((count / stats.totalDocuments) * 100);
              return (
                <div key={type} className="compare-pane">
                  <div className="compliance-score-number" style={{ color: 'var(--gold)' }}>{count}</div>
                  <div className="field-label">{type}</div>
                  <div className="risk-bar">
                    <div className="risk-bar-fill moderate" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="record-meta">{percentage}% SHARE</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="panel">
        <h3 className="panel-title">
          RECENT CROSS-EXAMINATIONS
        </h3>
        {stats.recentActivity.length === 0 ? (
          <p className="record-muted">No recent interrogations logged.</p>
        ) : (
          <div className="record-list">
            {stats.recentActivity.map((activity, idx) => (
              <div key={activity.id || idx} className="record-item">
                <div className="record-item-main">
                  <div className="record-item-title">{activity.documentTitle}</div>
                  <div className="record-meta">
                    Prompt: {activity.prompt} &bull; {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {activity.duration && (
                  <span className="court-speaker-badge badge-defense">
                    {(activity.duration / 1000).toFixed(1)}s LATENCY
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
