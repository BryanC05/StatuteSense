'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFPreview({ fileUrl, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '800px',
        marginBottom: '1rem',
      }}>
        <h3 style={{ color: '#fff', margin: 0 }}>PDF Preview</h3>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      {loading && (
        <div style={{ color: '#aaa', marginBottom: '1rem' }}>Loading PDF...</div>
      )}

      <div style={{
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
        overflow: 'auto',
        maxHeight: '70vh',
      }}>
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div style={{ padding: '2rem', color: '#aaa' }}>Loading...</div>}
          error={<div style={{ padding: '2rem', color: '#ff6464' }}>Failed to load PDF</div>}
        >
          <Page pageNumber={currentPage} width={600} />
        </Document>
      </div>

      {numPages && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginTop: '1rem',
          color: '#fff',
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,179,127,0.2)',
              border: '1px solid rgba(255,179,127,0.4)',
              color: '#ffb37f',
              borderRadius: '6px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage <= 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          <span>Page {currentPage} of {numPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
            disabled={currentPage >= numPages}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,179,127,0.2)',
              border: '1px solid rgba(255,179,127,0.4)',
              color: '#ffb37f',
              borderRadius: '6px',
              cursor: currentPage >= numPages ? 'not-allowed' : 'pointer',
              opacity: currentPage >= numPages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
