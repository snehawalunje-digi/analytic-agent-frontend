import { useEffect, useState } from "react";
import axios from "axios";
import MetricCards from "./MetricCard";
import { Eye, MousePointerClick, DollarSign, Target, Percent} from "lucide-react";
import Spinner from "./Spinner";

export default function GoogleAdsAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const start = new Date();
  start.setDate(start.getDate() - 29);
  const defaultStart = start.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(today);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/google-ads/overview`, {
        params: { startDate, endDate },
      });

      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load Google Ads analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div>{error}</div>;
  if (!data) return null;

  return (
    <div style={{ padding: "24px" }}>
      <header className="top-header">
        <h1>Google Ads Analytics</h1>
      </header>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={loadData}>Apply</button>
      </div>

      <div className="cards-grid">
        <MetricCards title="Impressions" value={data.summary.impressions} icon={<Eye />} />
        <MetricCards title="Clicks" value={data.summary.clicks} icon={<MousePointerClick />} />
        <MetricCards title="Cost" value={`₹${data.summary.cost}`} icon={<DollarSign />} />
        <MetricCards title="Conversions" value={data.summary.conversions} icon={<Target />} />
        <MetricCards title="CTR" value={`${data.summary.ctr}%`} icon={<Percent />} />
  {/*      <MetricCards title="Conversion Value" value={`₹${data.summary.conversionsValue}`} />
        <MetricCards title="ROAS" value={data.summary.roas} />*/}
      </div>

      <div style={{ marginTop: 28 }}>
        <h2>Campaign Performance</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {data.campaigns.map((campaign) => (
            <div
              key={campaign.campaignId}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
                background: "#fff",
              }}
            >
              <div><strong>{campaign.campaignName}</strong></div>
              <div>Status: {campaign.campaignStatus}</div>
              <div>Impressions: {campaign.impressions}</div>
              <div>Clicks: {campaign.clicks}</div>
              <div>Cost: ₹{campaign.cost.toFixed(2)}</div>
              <div>Conversions: {campaign.conversions}</div>
              <div>CTR: {campaign.ctr}%</div>
              <div>Avg CPC: ₹{campaign.avgCpc}</div>
         {/*     <div>Conversion Value: ₹{campaign.conversionsValue.toFixed(2)}</div>
              <div>ROAS: {campaign.roas}</div>*/}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ fontSize: 14, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{value}</div>
    </div>
  );
}