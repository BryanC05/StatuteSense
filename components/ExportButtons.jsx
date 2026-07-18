'use client';

import { useState } from 'react';

export default function ExportButtons({ content, title = 'Analysis Result' }) {
  const [exporting, setExporting] = useState(null);

  const exportToPDF = async () => {
    setExporting('pdf');
    try {
      // Use browser's print-to-PDF functionality
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Georgia, serif; padding: 40px; line-height: 1.6; }
              h1, h2, h3 { color: #333; }
              @media print { body { -webkit-print-color-adjust: exact; } }
            </style>
          </head>
          <body>
            <h1 style="text-align: center;">${title}</h1>
            <hr style="margin: 20px 0; border: none; border-top: 2px solid #ffb37f;" />
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  const exportToDOCX = async () => {
    setExporting('docx');
    try {
      // Call Python script via API (would need backend endpoint)
      // For now, use simple download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('DOCX export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button
        onClick={exportToPDF}
        disabled={exporting === 'pdf'}
        title="Export to PDF"
        style={{
          padding: '0.5rem 1rem',
          background: exporting === 'pdf' ? 'rgba(255,100,100,0.3)' : 'rgba(255,179,127,0.2)',
          border: '1px solid rgba(255,179,127,0.3)',
          color: exporting === 'pdf' ? '#ff6464' : '#ffb37f',
          borderRadius: '6px',
          cursor: exporting === 'pdf' ? 'not-allowed' : 'pointer',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        {exporting === 'pdf' ? 'Exporting...' : '📄 PDF'}
      </button>
      <button
        onClick={exportToDOCX}
        disabled={exporting === 'docx'}
        title="Export to DOCX"
        style={{
          padding: '0.5rem 1rem',
          background: exporting === 'docx' ? 'rgba(255,100,100,0.3)' : 'rgba(127,200,255,0.2)',
          border: '1px solid rgba(127,200,255,0.3)',
          color: exporting === 'docx' ? '#ff6464' : '#7fc8ff',
          borderRadius: '6px',
          cursor: exporting === 'docx' ? 'not-allowed' : 'pointer',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        {exporting === 'docx' ? 'Exporting...' : '📝 DOCX'}
      </button>
    </div>
  );
}
