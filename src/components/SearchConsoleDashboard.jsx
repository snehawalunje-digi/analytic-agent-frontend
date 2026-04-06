import { useEffect, useMemo, useState } from "react";
import MetricCards from "./MetricCard";

import {
  fetchSearchConsoleOverview,
  fetchSearchConsoleTopQueries,
  fetchSearchConsoleTopPages,
  fetchSearchConsoleDevices,
  fetchSearchConsoleCountries,
  fetchSearchConsoleQueryPages,
  fetchSearchConsoleCompare,
  fetchSearchConsoleLowCtr,
} from "../api/searchConsole";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

function formatPosition(value) {
  return Number(value || 0).toFixed(2);
}

function MetricCard({ title, value, subValue }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
      {subValue ? <div style={styles.cardSub}>{subValue}</div> : null}
    </div>
  );
}

function DataTable({ title, columns, rows }) {
  return (
    <div style={styles.tableCard}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={styles.th}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows?.length ? (
              rows.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col) => (
                    <td key={col.key} style={styles.td}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={styles.emptyCell}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SearchConsoleDashboard() {
  const userId = "default";

  const today = new Date();
  const defaultEnd = today.toISOString().slice(0, 10);
  const start = new Date(today);
  start.setDate(start.getDate() - 29);
  const defaultStart = start.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [overview, setOverview] = useState(null);
  const [topQueries, setTopQueries] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [countries, setCountries] = useState([]);
  const [queryPages, setQueryPages] = useState([]);
  const [lowCtr, setLowCtr] = useState([]);
  const [compare, setCompare] = useState(null);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const currentStart = new Date(startDate);
      const currentEnd = new Date(endDate);
      const diffDays = Math.round((currentEnd - currentStart) / (1000 * 60 * 60 * 24)) + 1;

      const previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);

      const previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - (diffDays - 1));

      const compareParams = {
        currentStartDate: startDate,
        currentEndDate: endDate,
        previousStartDate: previousStart.toISOString().slice(0, 10),
        previousEndDate: previousEnd.toISOString().slice(0, 10),
      };

      const [
        overviewData,
        topQueriesData,
        topPagesData,
        devicesData,
        countriesData,
        queryPagesData,
        lowCtrData,
        compareData,
      ] = await Promise.all([
        fetchSearchConsoleOverview(userId, startDate, endDate),
        fetchSearchConsoleTopQueries(userId, startDate, endDate),
        fetchSearchConsoleTopPages(userId, startDate, endDate),
        fetchSearchConsoleDevices(userId, startDate, endDate),
        fetchSearchConsoleCountries(userId, startDate, endDate),
        fetchSearchConsoleQueryPages(userId, startDate, endDate),
        fetchSearchConsoleLowCtr(userId, startDate, endDate),
        fetchSearchConsoleCompare(userId, compareParams),
      ]);

      setOverview(overviewData);
      setTopQueries(topQueriesData);
      setTopPages(topPagesData);
      setDevices(devicesData);
      setCountries(countriesData);
      setQueryPages(queryPagesData);
      setLowCtr(lowCtrData);
      setCompare(compareData);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Failed to load Search Console dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);


  const trendData = useMemo(() => {
    if (!overview?.trafficTrends?.dates) return [];

    return overview.trafficTrends.dates.map((date, index) => ({
      date,
      clicks: overview.trafficTrends.clicks?.[index] || 0,
      impressions: overview.trafficTrends.impressions?.[index] || 0,
      ctr: overview.trafficTrends.ctr?.[index] || 0,
      position: overview.trafficTrends.position?.[index] || 0,
    }));
  }, [overview]);

  const deviceChartData = useMemo(() => {
    return devices.map((item) => ({
      name: item.device,
      value: item.clicks,
    }));
  }, [devices]);

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Google Search Console Dashboard</h1>
          <p style={styles.pageSubtitle}>SEO performance, keyword visibility, and opportunities</p>
        </div>

        <div style={styles.filterRow}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.input}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.input}
          />
          <button onClick={loadDashboard} style={styles.button}>
            {loading ? "Loading..." : "Apply"}
          </button>
        </div>
      </div>

      {error ? <div style={styles.error}>{error}</div> : null}

      <div style={styles.grid4}>
        <MetricCard
          title="Total Clicks"
          value={formatNumber(overview?.totals?.clicks)}
          subValue={compare ? `Δ ${compare.growth?.clicks?.toFixed(2)}% vs previous period` : ""}
        />
        <MetricCard
          title="Total Impressions"
          value={formatNumber(overview?.totals?.impressions)}
          subValue={compare ? `Δ ${compare.growth?.impressions?.toFixed(2)}% vs previous period` : ""}
        />
        <MetricCard
          title="Average CTR"
          value={formatPercent(overview?.totals?.ctr)}
          subValue={compare ? `Δ ${compare.growth?.ctr?.toFixed(2)}% vs previous period` : ""}
        />
        <MetricCard
          title="Average Position"
          value={formatPosition(overview?.totals?.position)}
          subValue={compare ? `Δ ${compare.growth?.position?.toFixed(2)}% vs previous period` : ""}
        />
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.sectionTitle}>Clicks & Impressions Trend</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={2} />
            <Line type="monotone" dataKey="impressions" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.grid2}>
        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>Device Performance (by Clicks)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={deviceChartData} dataKey="value" nameKey="name" outerRadius={100} label>
                {deviceChartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={["#2563eb", "#16a34a", "#f59e0b", "#dc2626"][index % 4]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>Top Countries by Clicks</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={countries.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clicks" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        title="Top Queries"
        columns={[
          { key: "query", label: "Query" },
          { key: "clicks", label: "Clicks" },
          { key: "impressions", label: "Impressions" },
          { key: "ctr", label: "CTR", render: (v) => formatPercent(v) },
          { key: "position", label: "Position", render: (v) => formatPosition(v) },
        ]}
        rows={topQueries}
      />

      <DataTable
        title="Top Pages"
        columns={[
          { key: "page", label: "Page" },
          { key: "clicks", label: "Clicks" },
          { key: "impressions", label: "Impressions" },
          { key: "ctr", label: "CTR", render: (v) => formatPercent(v) },
          { key: "position", label: "Position", render: (v) => formatPosition(v) },
        ]}
        rows={topPages}
      />

      <DataTable
        title="Query + Page Performance"
        columns={[
          { key: "query", label: "Query" },
          { key: "page", label: "Page" },
          { key: "clicks", label: "Clicks" },
          { key: "impressions", label: "Impressions" },
          { key: "ctr", label: "CTR", render: (v) => formatPercent(v) },
          { key: "position", label: "Position", render: (v) => formatPosition(v) },
        ]}
        rows={queryPages}
      />

      <DataTable
        title="Low CTR Opportunities"
        columns={[
          { key: "query", label: "Query" },
          { key: "page", label: "Page" },
          { key: "clicks", label: "Clicks" },
          { key: "impressions", label: "Impressions" },
          { key: "ctr", label: "CTR", render: (v) => formatPercent(v) },
          { key: "position", label: "Position", render: (v) => formatPosition(v) },
        ]}
        rows={lowCtr}
      />
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
  },
  pageSubtitle: {
    margin: "6px 0 0 0",
    color: "#475569",
  },
  filterRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
  },
  button: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    background: "#fff",
    padding: "18px",
    borderRadius: "14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "8px",
  },
  cardValue: {
    fontSize: "30px",
    fontWeight: 700,
    color: "#0f172a",
  },
  cardSub: {
    marginTop: "8px",
    color: "#475569",
    fontSize: "13px",
  },
  chartCard: {
    background: "#fff",
    padding: "18px",
    borderRadius: "14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    marginBottom: "24px",
  },
  tableCard: {
    background: "#fff",
    padding: "18px",
    borderRadius: "14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    marginBottom: "24px",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "16px",
    fontSize: "18px",
    fontWeight: 700,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "14px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "14px",
    verticalAlign: "top",
  },
  emptyCell: {
    padding: "16px",
    textAlign: "center",
    color: "#64748b",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
};