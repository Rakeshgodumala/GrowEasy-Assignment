import React from "react";

// Step 2 (preview) - just shows the raw csv rows in a table, no AI yet
// Step 3 (confirm) - the Confirm button here is what actually triggers the backend call
function PreviewTable({ rows, fileName, onConfirm, onCancel }) {
  // column headers are just the keys of the first row
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-filetype-csv fs-3 text-success"></i>
        <div>
          <strong>{fileName}</strong>
          <div className="text-muted small">{rows.length} rows found</div>
        </div>
      </div>

      {/* table-responsive makes it scroll horizontally on small screens */}
      <div className="table-scroll border rounded-3">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button className="btn btn-outline-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={onConfirm}>
          Confirm Import
        </button>
      </div>
    </div>
  );
}

export default PreviewTable;