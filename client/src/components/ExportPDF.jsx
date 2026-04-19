import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";
import { sampleTrip } from "../data/sampleTrip.js";

export default function ExportPDF() {
  const [trip] = useState(sampleTrip);

  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareFile, setShareFile] = useState(null);
  const [message, setMessage] = useState("");

  const generatePDF = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/pdf/generate`,
        { trip },
        { responseType: "blob" }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      setShareUrl(url);

      const filename = `${trip.name.replace(/\s+/g, "_")}_Itinerary.pdf`;
      const file = new File([pdfBlob], filename, { type: "application/pdf" });
      setShareFile(file);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage("PDF generated and downloaded.");
    } catch (err) {
      setMessage("Failed to generate PDF.");
    } finally {
      setLoading(false);
    }
  };

  const sharePDF = async () => {
    try {
      if (!shareUrl) {
        setMessage("Generate PDF first.");
        return;
      }

      if (navigator.canShare && shareFile && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({
          title: "My Trip Itinerary",
          text: `Trip to ${trip.destination}`,
          files: [shareFile],
        });
        setMessage("Shared successfully.");
        return;
      }

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        `My trip itinerary is ready: ${trip.name}`
      )}`;
      window.open(whatsappUrl, "_blank");
      setMessage("Opened WhatsApp sharing. Attach downloaded PDF there.");
    } catch (err) {
      setMessage("Share cancelled or not supported.");
    }
  };

  return (
    <section className="card">
      <h2>Export Trip to PDF</h2>
      <p>
        <b>{trip.name}</b> - {trip.destination} ({trip.startDate} to {trip.endDate})
      </p>
      <button onClick={generatePDF} disabled={loading}>
        {loading ? "Generating..." : "Download Trip PDF"}
      </button>
      <button className="secondary" onClick={sharePDF}>
        Share PDF
      </button>
      {message ? <p>{message}</p> : null}
    </section>
  );
}
