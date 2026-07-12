

import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import PreviewTable from "./components/PreviewTable";
import ResultTable from "./components/ResultTable";
import Loader from "./components/Loader";
import ManageLeads from "./components/ManageLeads"; // new

const API_URL = "http://localhost:5000/api/import/process";

function App() {
  const [step, setStep] = useState("upload");
  const [activeScreen, setActiveScreen] = useState("import"); // new: "import" or "manage"

  const [csvRows, setCsvRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileParsed = (rows, name) => {
    setCsvRows(rows);
    setFileName(name);
    setStep("preview");
  };

  const handleConfirm = async () => {
    setStep("loading");
    setErrorMsg("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: csvRows }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "Something went wrong on the server");
      }

      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch (err) {
      setErrorMsg(err.message || "Import failed, please try again");
      setStep("preview");
    }
  };

  const handleStartOver = () => {
    setCsvRows([]);
    setFileName("");
    setResult(null);
    setErrorMsg("");
    setStep("upload");
  };

  return (
    <div className="app-wrapper">
      <nav className="navbar bg-white border-bottom px-4 d-flex justify-content-between">
        <span className="navbar-brand fw-bold">
          <i className="bi bi-magic text-primary me-2"></i>
          GrowEasy CSV Importer
        </span>

        {/* simple tab switcher between Import and Manage Leads screens */}
        <div className="btn-group">
          <button
            className={`btn btn-sm ${activeScreen === "import" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveScreen("import")}
          >
            Import CSV
          </button>
          <button
            className={`btn btn-sm ${activeScreen === "manage" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveScreen("manage")}
          >
            Manage Leads
          </button>
        </div>
      </nav>

      <div className="container py-4">
        <div className="card shadow-sm border-0 rounded-4 p-4">
          {activeScreen === "import" && (
            <>
              <h4 className="fw-bold">Import Leads via CSV</h4>
              <p className="text-muted">Upload any CSV format, AI will map it to CRM fields automatically.</p>

              {errorMsg && step === "preview" && (
                <div className="alert alert-danger">{errorMsg}</div>
              )}

              {step === "upload" && <FileUpload onFileParsed={handleFileParsed} />}

              {step === "preview" && (
                <PreviewTable
                  rows={csvRows}
                  fileName={fileName}
                  onConfirm={handleConfirm}
                  onCancel={handleStartOver}
                />
              )}

              {step === "loading" && <Loader text="AI is mapping your CRM fields, please wait..." />}

              {step === "result" && result && (
                <ResultTable result={result} onStartOver={handleStartOver} />
              )}
            </>
          )}

          {activeScreen === "manage" && <ManageLeads />}
        </div>
      </div>
    </div>
  );
}

export default App;











