import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

export default function TravelDocumentsVault() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ docType: "passport", tripName: "", file: null });

  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/documents`);
      setDocuments(res.data.documents || []);
    } catch (_err) {
      setError("Unable to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uploadDocument = async (event) => {
    event.preventDefault();
    if (!form.file) {
      setError("Please choose a file to upload.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("document", form.file);
      body.append("docType", form.docType);
      body.append("tripName", form.tripName);
      await axios.post(`${API_BASE_URL}/api/documents/upload`, body);
      setForm({ docType: "passport", tripName: "", file: null });
      await fetchDocuments();
    } catch (_err) {
      setError("Upload failed. Use PDF/JPG/PNG/WEBP up to 10MB.");
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (id) => {
    await axios.delete(`${API_BASE_URL}/api/documents/${id}`);
    await fetchDocuments();
  };

  return (
    <section className="card">
      <h2>Feature 4: Travel Documents Vault</h2>
      <form className="weather-form" onSubmit={uploadDocument}>
        <label>
          Document type
          <select
            value={form.docType}
            onChange={(e) => setForm((prev) => ({ ...prev, docType: e.target.value }))}
          >
            <option value="passport">Passport</option>
            <option value="visa">Visa</option>
            <option value="ticket">Ticket</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Trip name
          <input
            value={form.tripName}
            onChange={(e) => setForm((prev) => ({ ...prev, tripName: e.target.value }))}
            placeholder="Summer trip"
          />
        </label>
        <label>
          Upload document
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
          />
        </label>
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p>Loading documents...</p> : null}

      <div className="list-stack">
        {documents.map((doc) => (
          <article key={doc._id} className="row-card">
            <div>
              <strong>{doc.originalName}</strong>
              <p>{doc.docType} {doc.tripName ? `- ${doc.tripName}` : ""}</p>
            </div>
            <div className="row-actions">
              <a href={`${API_BASE_URL}/api/documents/${doc._id}/view`} target="_blank" rel="noreferrer">
                View
              </a>
              <a href={`${API_BASE_URL}/api/documents/${doc._id}/download`}>Download</a>
              <button type="button" className="danger" onClick={() => removeDocument(doc._id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
