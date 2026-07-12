import React, { useState } from "react";

// Step 4 (display result) - shows what the backend + AI returned
// two tabs: successfully imported records, and skipped ones with the reason why
function ResultTable({ result, onStartOver }) {
  const [activeTab, setActiveTab] = useState("imported");

  const imported = result.records || [];
  const skipped = result.skipped || [];

  const columns =
    imported.length > 0
      ? Object.keys(imported[0])
      : ["created_at", "name", "email", "mobile_without_country_code", "crm_status"];

  return (
    <div>
      {/* quick stats on top */}
      <div className="row g-3 mb-4">
        <div className="col-6">
          <div className="p-3 rounded-3 bg-success-subtle text-center">
            <div className="fs-4 fw-bold text-success">{result.totalImported}</div>
            <div className="small text-muted">Imported</div>
          </div>
        </div>
        <div className="col-6">
          <div className="p-3 rounded-3 bg-danger-subtle text-center">
            <div className="fs-4 fw-bold text-danger">{result.totalSkipped}</div>
            <div className="small text-muted">Skipped</div>
          </div>
        </div>
      </div>

      {/* tab buttons */}
      <div className="btn-group mb-3">
        <button
          className={`btn btn-sm ${activeTab === "imported" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("imported")}
        >
          Imported ({imported.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === "skipped" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("skipped")}
        >
          Skipped ({skipped.length})
        </button>
      </div>

      {activeTab === "imported" && (
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
              {imported.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="text-center text-muted py-4">
                    No records imported
                  </td>
                </tr>
              )}
              {imported.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "skipped" && (
        <div className="table-scroll border rounded-3">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Row</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {skipped.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center text-muted py-4">
                    Nothing skipped
                  </td>
                </tr>
              )}
              {skipped.map((item, i) => (
                <tr key={i}>
                  <td className="small">{JSON.stringify(item.row)}</td>
                  <td>{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-end mt-3">
        <button className="btn btn-outline-primary" onClick={onStartOver}>
          Import Another File
        </button>
      </div>
    </div>
  );
}

export default ResultTable;