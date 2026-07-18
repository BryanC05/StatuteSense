'use client';

import { useState, useEffect } from 'react';

export default function DocumentHistory({ onDocumentSelect }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.documentType === filterType;
    return matchesSearch && matchesType;
  });

  const handleQuickReAnalyze = async (doc) => {
    if (onDocumentSelect) {
      onDocumentSelect({
        text: doc.originalText,
        type: doc.documentType,
        title: doc.title,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      setDocuments(documents.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1a1a1a' }}>
        📁 Document History
      </h2>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #d0d5de',
            fontSize: '0.875rem',
          }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #d0d5de',
            fontSize: '0.875rem',
            background: 'white',
          }}
        >
          <option value="all">All Types</option>
          <option value="Contract">Contract</option>
          <option value="NDA">NDA</option>
          <option value="Lease">Lease</option>
          <option value="Privacy Policy">Privacy Policy</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Document List */}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {loading ? (
          <p style={{ color: '#667085', fontStyle: 'italic' }}>Loading documents...</p>
        ) : filteredDocuments.length === 0 ? (
          <p style={{ color: '#667085' }}>
            {searchTerm || filterType !== 'all' 
              ? 'No matching documents found' 
              : 'No documents yet. Upload one to get started!'}
          </p>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e4e7ec',
                background: '#f9fafb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: '#101828' }}>
                  {doc.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#667085', margin: 0 }}>
                  {doc.documentType} • {doc.fileType} 
                  {doc.fileSize ? ` • ${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
                  {' • '}
                  {new Date(doc.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {doc.analyses?.length ? ` • ${doc.analyses.length} analysis${doc.analyses.length > 1 ? 'es' : ''}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleQuickReAnalyze(doc)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'linear-gradient(90deg, #d68843 0%, #c77d63 100%)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Re-Analyze
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #d0d5de',
                    background: 'white',
                    color: '#667085',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
