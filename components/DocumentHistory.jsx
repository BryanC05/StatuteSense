'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDocuments, getAnalyses, deleteDocument } from '../lib/storage';

export default function DocumentHistory({ onDocumentSelect }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchDocuments = useCallback(() => {
    setLoading(true);
    const docs = getDocuments();
    const analyses = getAnalyses();

    const docsWithAnalyses = docs.map((doc) => ({
      ...doc,
      analyses: analyses.filter((a) => a.documentId === doc.id),
    }));

    setDocuments(docsWithAnalyses);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.documentType === filterType;
    return matchesSearch && matchesType;
  });

  const handleQuickReAnalyze = (doc) => {
    if (onDocumentSelect) {
      onDocumentSelect({
        text: doc.originalText,
        type: doc.documentType,
        title: doc.title,
      });
    }
  };

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this document and its analyses?')) return;
    deleteDocument(id);
    setDocuments(documents.filter(d => d.id !== id));
  };

  const handleClearAll = () => {
    if (!confirm('This will delete ALL documents and analyses from local history. Continue?')) return;
    localStorage.removeItem('statutesense_documents');
    localStorage.removeItem('statutesense_analyses');
    setDocuments([]);
  };

  return (
    <div className="record-panel">
      <div className="record-header">
        <div>
          <span className="panel-number">03</span>
          <h2 className="record-title">Court Record</h2>
        </div>
        {documents.length > 0 && (
          <button
            onClick={handleClearAll}
            className="record-clear-btn"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="record-controls">
        <input
          type="text"
          placeholder="Search case files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="record-search"
        />
        <span className="select-frame record-select-frame">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="record-select"
          >
            <option value="all">All Types</option>
            <option value="Contract">Contract</option>
            <option value="NDA">NDA</option>
            <option value="Lease">Lease</option>
            <option value="Privacy Policy">Privacy Policy</option>
            <option value="Other">Other</option>
          </select>
        </span>
      </div>

      <div className="record-list">
        {loading ? (
          <p className="record-muted">Opening the archive...</p>
        ) : filteredDocuments.length === 0 ? (
          <p className="record-muted">
            {searchTerm || filterType !== 'all'
              ? 'No matching case files found.'
              : 'No case files yet. Present evidence to begin.'}
          </p>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="record-item"
            >
              <div className="record-item-main">
                <h3 className="record-item-title">
                  {doc.title}
                </h3>
                <p className="record-meta">
                  {doc.documentType} &bull; {doc.fileType}
                  {doc.fileSize ? ` &bull; ${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
                  {' &bull; '}
                  {new Date(doc.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {doc.analyses?.length ? ` &bull; ${doc.analyses.length} analysis${doc.analyses.length > 1 ? 'es' : ''}` : ''}
                </p>
              </div>
              <div className="record-actions">
                <button
                  onClick={() => handleQuickReAnalyze(doc)}
                  className="record-primary-btn"
                >
                  Reopen
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="record-delete-btn"
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
