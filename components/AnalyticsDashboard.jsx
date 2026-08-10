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
          documentTitle: docMap[a.documentId]?.title || 'Unknown',
        })),
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading analytics...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#f0e6d2', marginBottom: '1.5rem' }}>Analytics Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(255,179,127,0.1), rgba(255,140,84,0.1))',
          border: '1px solid rgba(255,179,127,0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ffb37f' }}>{stats.totalDocuments}</div>
          <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Total Documents</div>
        </div>
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(127,200,255,0.1), rgba(84,156,255,0.1))',
          border: '1px solid rgba(127,200,255,0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#7fc8ff' }}>{stats.totalAnalyses}</div>
          <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Total Analyses</div>
        </div>
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(127,255,180,0.1), rgba(84,255,158,0.1))',
          border: '1px solid rgba(127,255,180,0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Avg per Doc</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#7fffb4' }}>
            {stats.totalDocuments > 0 ? (stats.totalAnalyses / stats.totalDocuments).toFixed(1) : '0'}
          </div>
        </div>
      </div>

      <div style={{
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '2rem',
      }}>
        <h3 style={{ color: '#f0e6d2', marginBottom: '1rem' }}>Documents by Type</h3>
        {stats.documentsByType.length === 0 ? (
          <p style={{ color: '#888' }}>No documents yet</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {stats.documentsByType.map(({ type, count }) => {
              const percentage = Math.round((count / stats.totalDocuments) * 100);
              return (
                <div key={type} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffb37f' }}>{count}</div>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem' }}>{type}</div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #ffb37f, #ff8c54)' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>{percentage}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <h3 style={{ color: '#f0e6d2', marginBottom: '1rem' }}>Recent Analyses</h3>
        {stats.recentActivity.length === 0 ? (
          <p style={{ color: '#888' }}>No recent activity</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentActivity.map((activity, idx) => (
              <div key={activity.id || idx} style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#f0e6d2', fontWeight: '500' }}>{activity.documentTitle}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                      {activity.prompt} &bull; {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {activity.duration && (
                    <div style={{ fontSize: '0.75rem', color: '#7fc8ff', background: 'rgba(127,200,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {(activity.duration / 1000).toFixed(1)}s
                    </div>
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
