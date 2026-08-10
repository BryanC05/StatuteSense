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
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-action)', fontSize: '1.2rem', color: 'var(--gold)', letterSpacing: '1px' }}>
        LOADING TRIAL ANALYTICS RECORD...
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem 0' }}>
      <div className="record-header">
        <h2 className="record-title" style={{ fontFamily: 'var(--font-header)', letterSpacing: '0.5px' }}>
          TRIAL & EVIDENCE ANALYTICS
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #18253d 0%, #0d1526 100%)',
          border: '3px solid var(--gold)',
          boxShadow: '4px 4px 0 #000000',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-action)', fontSize: '3rem', color: 'var(--gold)', textShadow: '2px 2px 0 #000', lineHeight: 1 }}>
            {stats.totalDocuments}
          </div>
          <div style={{ fontFamily: 'var(--font-action)', fontSize: '1rem', color: 'var(--text)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '6px' }}>
            TOTAL COURT EVIDENCE
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #0f2744 0%, #09172a 100%)',
          border: '3px solid var(--defense-blue)',
          boxShadow: '4px 4px 0 #000000',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-action)', fontSize: '3rem', color: 'var(--cyan)', textShadow: '2px 2px 0 #000', lineHeight: 1 }}>
            {stats.totalAnalyses}
          </div>
          <div style={{ fontFamily: 'var(--font-action)', fontSize: '1rem', color: 'var(--text)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '6px' }}>
            CROSS-EXAMINATIONS
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #2b0c12 0%, #150508 100%)',
          border: '3px solid var(--prosecution-red)',
          boxShadow: '4px 4px 0 #000000',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-action)', fontSize: '3rem', color: '#ff667a', textShadow: '2px 2px 0 #000', lineHeight: 1 }}>
            {stats.totalDocuments > 0 ? (stats.totalAnalyses / stats.totalDocuments).toFixed(1) : '0'}
          </div>
          <div style={{ fontFamily: 'var(--font-action)', fontSize: '1rem', color: 'var(--text)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '6px' }}>
            AVG DIRECTIVES PER CASE
          </div>
        </div>
      </div>

      <div style={{
        padding: '20px',
        background: 'linear-gradient(180deg, #0e1526 0%, #070b15 100%)',
        border: '3px solid var(--gold)',
        boxShadow: '4px 4px 0 #000000',
        marginBottom: '24px',
      }}>
        <h3 style={{ fontFamily: 'var(--font-header)', color: 'var(--paper)', fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--gold)' }}>
          EVIDENCE CLASSIFICATION BREAKDOWN
        </h3>
        {stats.documentsByType.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No case evidence files registered.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            {stats.documentsByType.map(({ type, count }) => {
              const percentage = Math.round((count / stats.totalDocuments) * 100);
              return (
                <div key={type} style={{ textAlign: 'center', padding: '14px', background: '#090e1a', border: '2px solid rgba(255, 203, 61, 0.25)', boxShadow: '2px 2px 0 #000' }}>
                  <div style={{ fontFamily: 'var(--font-action)', fontSize: '1.8rem', color: 'var(--gold)', textShadow: '1px 1px 0 #000' }}>{count}</div>
                  <div style={{ fontFamily: 'var(--font-action)', fontSize: '0.95rem', color: 'var(--paper)', letterSpacing: '1px', textTransform: 'uppercase', margin: '4px 0 8px' }}>{type}</div>
                  <div style={{ height: '8px', background: '#000000', border: '1px solid var(--gold)', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold), var(--prosecution-red))' }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-action)', fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>{percentage}% SHARE</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{
        padding: '20px',
        background: 'linear-gradient(180deg, #0e1526 0%, #070b15 100%)',
        border: '3px solid var(--gold)',
        boxShadow: '4px 4px 0 #000000',
      }}>
        <h3 style={{ fontFamily: 'var(--font-header)', color: 'var(--paper)', fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--gold)' }}>
          RECENT CROSS-EXAMINATIONS
        </h3>
        {stats.recentActivity.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No recent interrogations logged.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.recentActivity.map((activity, idx) => (
              <div key={activity.id || idx} style={{
                padding: '14px 18px',
                background: '#090e1a',
                border: '2px solid rgba(255, 203, 61, 0.25)',
                borderLeft: '5px solid var(--defense-blue)',
                boxShadow: '3px 3px 0 #000000',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-action)', fontSize: '1.1rem', color: 'var(--paper)', letterSpacing: '0.5px' }}>{activity.documentTitle}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
                      Prompt: {activity.prompt} &bull; {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {activity.duration && (
                    <span className="court-speaker-badge badge-defense" style={{ fontSize: "0.85rem" }}>
                      {(activity.duration / 1000).toFixed(1)}s LATENCY
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
