import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "./Spinner";
import MetricCard from "./MetricCard";
import {
  FileText,
  Users,
  MessageCircle,
  Share2,
  Heart,
  BarChart3,
} from "lucide-react";

export default function FacebookAnalytics() {
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

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/facebook/overview`,
        { params: { startDate, endDate } }
      );

      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load Facebook analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding: 24 }}>{error}</div>;
  if (!data) return <div style={{ padding: 24 }}>No data available.</div>;

  return (
    <div style={{ padding: "24px" }}>
      <h1>Facebook Analytics</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={loadData}>Apply</button>
      </div>

      <div className="cards-grid">
        <MetricCard title="Posts Published" value={data.summary.postsPublished} icon={<FileText size={28} />} />
        <MetricCard title="Followers" value={data.profile.followersCount} icon={<Users size={28} />} />
        <MetricCard title="Reactions" value={data.summary.reactions} icon={<Heart size={28} />} />
        <MetricCard title="Comments" value={data.summary.comments} icon={<MessageCircle size={28} />} />
        <MetricCard title="Shares" value={data.summary.shares} icon={<Share2 size={28} />} />
        <MetricCard title="Total Engagement" value={data.summary.totalEngagement} icon={<BarChart3 size={28} />} />
      </div>

      <div style={{ marginTop: 28 }}>
        <h2>Recent Posts</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {data.posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
                background: "#fff",
              }}
            >
              <div><strong>{new Date(post.created_time).toLocaleString()}</strong></div>
              <div>{post.message || "No message"}</div>
              <div>Reactions: {post.reactions}</div>
              <div>Comments: {post.comments}</div>
              <div>Shares: {post.shares}</div>
              <div>Total Engagement: {post.totalEngagement}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}