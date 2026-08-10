/**
 * Triggers clean legal court docket print / PDF export
 */
export function exportToPDF(title = "OFFICIAL COURT BRIEF", contentHtml = "") {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - StatuteSense Official Court Record</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #111;
            padding: 40px;
          }
          .header {
            border-bottom: 3px double #000;
            padding-bottom: 12px;
            margin-bottom: 24px;
            text-align: center;
          }
          .header h1 {
            font-size: 24px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .header p {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #555;
          }
          .disclaimer {
            background: #fff8e1;
            border: 1px solid #ffe082;
            padding: 10px 14px;
            font-size: 12px;
            margin-bottom: 20px;
          }
          .content {
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
            font-size: 11px;
            color: #777;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>STATUTESENSE OFFICIAL COURT DOCKET BRIEF</h1>
          <p>CONFIDENTIAL ATTORNEY-CLIENT PRIVILEGED WORK PRODUCT | GENERATED ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="disclaimer">
          <strong>COURT AI ADVISORY:</strong> This document was compiled using AI legal analysis tools. Verify all statutory codes, case citations, and contract terms with qualified legal counsel.
        </div>
        <div class="content">
          ${contentHtml}
        </div>
        <div class="footer">
          StatuteSense Courtroom Intelligence System &bull; Official Legal Record
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
