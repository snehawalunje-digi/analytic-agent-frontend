import { useEffect, useState } from "react";
import MetricCards from "./MetricCard";
import { LineChart, Users, Eye, Target } from "lucide-react";

function Dashboard({ startDate, endDate }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const downloadPDF = () => {
    window.open(
      `${import.meta.env.VITE_API_URL}/api/download-report?startDate=${startDate}&endDate=${endDate}`,
      "_blank"
    );
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data.totals);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API error:", err);
        setLoading(false);
      });
  }, [startDate, endDate]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (!metrics) {
    return <p>Failed to load metrics.</p>;
  }

  return (
    <div className="dashboard-section">
      <div className="cards-grid">
        <MetricCards title="Sessions" value={metrics.sessions} icon={<LineChart />} />
        <MetricCards title="Active Users" value={metrics.activeUsers} icon={<Users />} />
        <MetricCards title="Page Views" value={metrics.pageViews} icon={<Eye />} />
        <MetricCards title="Conversions" value={metrics.conversions ?? 0} icon={<Target />} />
      </div>
      <div className="reports-section">
        <h2>GA4 Reports</h2>
        <div className="report-card">
          <button className="download-btn" onClick={downloadPDF}>
            Download GA4 Report PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;