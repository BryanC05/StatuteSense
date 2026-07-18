'use client';

import { useState } from 'react';
import { marked } from 'marked';

export default function DocumentComparison({ analysis1, analysis2 }) {
  const [viewMode, setViewMode] = useState('side-by-side');

  if (!analysis1 || !analysis2) {
    return null;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: '#f0e6d2', margin: 0 }}>Compare Analyses</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('side-by-side')}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'side-by-side' ? 'rgba(255,179,127,0.3)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,179,127,0.3)',
              color: viewMode === 'side-by-side' ? '#ffb37f' : '#aaa',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Side by Side
          </button>
          <button
            onClick={() => setViewMode('stacked')}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'stacked' ? 'rgba(255,179,127,0.3)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,179,127,0.3)',
              color: viewMode === 'stacked' ? '#ffb37f' : '#aaa',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Stacked
          </button>
        </div>
      </div>

      {viewMode === 'side-by-side' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,179,127,0.05)', borderRadius: '8px', border: '1px solid rgba(255,179,127,0.2)' }}>
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: marked.parse(analysis1) }}
              style={{ maxHeight: '60vh', overflowY: 'auto' }}
            />
          </div>
          <div style={{ padding: '1rem', background: 'rgba(127,200,255,0.05)', borderRadius: '8px', border: '1px solid rgba(127,200,255,0.2)' }}>
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: marked.parse(analysis2) }}
              style={{ maxHeight: '60vh', overflowY: 'auto' }}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,179,127,0.05)', borderRadius: '8px', border: '1px solid rgba(255,179,127,0.2)' }}>
            <h4 style={{ color: '#ffb37f', marginBottom: '0.5rem' }}>Analysis 1</h4>
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: marked.parse(analysis1) }}
              style={{ maxHeight: '40vh', overflowY: 'auto' }}
            />
          </div>
          <div style={{ padding: '1rem', background: 'rgba(127,200,255,0.05)', borderRadius: '8px', border: '1px solid rgba(127,200,255,0.2)' }}>
            <h4 style={{ color: '#7fc8ff', marginBottom: '0.5rem' }}>Analysis 2</h4>
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: marked.parse(analysis2) }}
              style={{ maxHeight: '40vh', overflowY: 'auto' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
