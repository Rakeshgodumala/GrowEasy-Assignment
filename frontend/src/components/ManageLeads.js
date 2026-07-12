import React, { useEffect, useState } from "react";

const LEADS_URL = "http://localhost:5000/api/import/leads";

// this is the "Manage Your Leads" screen - shows everything saved in MongoDB
// so far, regardless of which CSV upload session it came from
function ManageLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // runs once when this screen is opened
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch(LEADS_URL);
        if (!res.ok) throw new Error("Could not load leads");
        const data = await res.json();
        setLeads(data.leads || []);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  if (loading) {
    return <p className="text-muted py-4">Loading saved leads...</p>;
  }

  if (errorMsg) {
    return <div className="alert alert-danger">{errorMsg}</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">All Saved Leads ({leads.length})</h5>
      </div>

      <div className="table-scroll border rounded-3">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Company</th>
              <th>City</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  No leads saved yet, import a CSV first
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead._id}>
                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.mobile_without_country_code}</td>
                <td>{lead.company}</td>
                <td>{lead.city}</td>
                <td>
                  {lead.crm_status && (
                    <span className={`badge status-${lead.crm_status}`}>
                      {lead.crm_status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageLeads;