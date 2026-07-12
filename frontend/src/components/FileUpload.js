import React, { useRef, useState } from "react";
import Papa from "papaparse";

// handles Step 1 (upload) - drag & drop or click to browse
// once a valid csv is picked, it parses it and sends the data up to App.js
function FileUpload({ onFileParsed }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // this runs whenever a file is picked, either by drop or by browse click
  const processFile = (file) => {
    setErrorMsg("");

    if (!file) return;

    // basic validation - only csv, max 5mb
    const isCsv = file.name.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      setErrorMsg("Only .csv files are allowed");
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMsg("File is too big, please keep it under 5MB");
      return;
    }

    // parse the csv into rows of objects, e.g. { name: "John", email: "..." }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data || result.data.length === 0) {
          setErrorMsg("This CSV looks empty");
          return;
        }
        onFileParsed(result.data, file.name);
      },
      error: () => {
        setErrorMsg("Could not read this CSV file");
      },
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <div
        className={`upload-zone text-center p-5 rounded-4 ${isDragging ? "upload-zone-active" : ""}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <i className="bi bi-cloud-arrow-up fs-1 text-primary"></i>
        <h5 className="mt-3">Drop your CSV file here</h5>
        <p className="text-muted">or click to browse files</p>
        <span className="badge bg-light text-dark border">Max size 5MB</span>

        {/* hidden file input, triggered by clicking the box above */}
        <input
          type="file"
          accept=".csv"
          ref={inputRef}
          hidden
          onChange={(e) => processFile(e.target.files[0])}
        />
      </div>

      {errorMsg && (
        <div className="alert alert-danger mt-3">{errorMsg}</div>
      )}
    </div>
  );
}

export default FileUpload;