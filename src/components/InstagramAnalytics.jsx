import { useEffect, useState } from "react";
import axios from "axios";
import MetricCards from "./MetricCard";
import {Image, Users, BarChart3, Percent, Heart, MessageCircle, Eye, Play} from "lucide-react";
import Spinner from "./Spinner";

export default function InstagramAnalytics() {
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

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/instagram/overview`, {
        params: { startDate, endDate },
      });

      setData(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Failed to load Instagram analytics"
      );
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

  const breakdownEntries = Object.entries(data.breakdown || {});

  return (
    <div style={{ padding: "24px" }}>
      <header className="top-header">
        <h1>Instagram Analytics</h1>
      </header>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={loadData}>Apply</button>
      </div>

      <div className="cards-grid">
        <MetricCards title="Posts Published" value={data.summary.postsPublished} icon={<Image />} />
        <MetricCards title="Followers" value={data.profile.followersCount} icon={<Users />}/>
        <MetricCards title="Total Engagement" value={data.summary.totalEngagement} icon={<BarChart3 />} />
        <MetricCards title="Avg Engagement Rate" value={`${data.summary.avgEngagementRate}%`} icon={<Percent />} />
        <MetricCards title="Likes" value={data.summary.totalLikes} icon={<Heart />} />
        <MetricCards title="Comments" value={data.summary.totalComments} icon={<MessageCircle />} />
        <MetricCards title="Reach" value={data.summary.totalReach} icon={<Eye />} />
        <MetricCards title="Views" value={data.summary.totalViews} icon={<Play />} />
      </div>

      <div style={{ marginTop: 28 }}>
        <h2>Follower Growth</h2>
        <p>Current Followers: {data.followerGrowth?.currentFollowers || 0}</p>
        <p>Growth: {data.followerGrowth?.absoluteGrowth || 0}</p>
        <p>Growth Rate: {data.followerGrowth?.growthRate || 0}%</p>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2>Content Breakdown</h2>
        {breakdownEntries.map(([key, value]) => (
          <div key={key}>
            {key}: {value}
          </div>
        ))}
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
              <div><strong>{post.media_type}</strong></div>
              <div>{post.caption || "No caption"}</div>
              <div>{new Date(post.timestamp).toLocaleString()}</div>
              <div>Likes: {post.like_count || 0}</div>
              <div>Comments: {post.comments_count || 0}</div>
              <div>Reach: {post.reach || 0}</div>
              <div>Views: {post.views || 0}</div>
              <div>Engagement Rate: {post.engagementRate || 0}%</div>
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