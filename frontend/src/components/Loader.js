import React from "react";

// simple spinner shown while backend is processing the AI extraction
function Loader({ text }) {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted mt-3">{text}</p>
    </div>
  );
}

export default Loader;