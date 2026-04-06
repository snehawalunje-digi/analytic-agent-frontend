import "./App.css";
import { Routes, Route, NavLink } from "react-router-dom";
import logo from "./assets/Digitalzone-logo.png";
import Dashboard from "./components/Dashboard";
import InstagramAnalytics from "./components/InstagramAnalytics";
import { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import ChatAssistant from "./components/ChatAssist";
import { Home } from "lucide-react";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { SiGoogleads } from "react-icons/si";
import { FiSearch } from "react-icons/fi";
import GoogleAdsAnalytics from "./components/GoogleAdsAnalytics";
import Loader from "./components/Loader";
import FacebookAnalytics from "./components/FacebookAnalytics";
import SearchConsoleDashboard from "./components/SearchConsoleDashboard";


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  function setLast7Days() {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 7);
    setStartDate(formatDate(past));
    setEndDate(formatDate(today));
  }

  function setLast30Days() {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 30);
    setStartDate(formatDate(past));
    setEndDate(formatDate(today));
  }

  function setThisMonth() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(today));
  }

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      });
    }, [startDate, endDate]);


  if (loading) return <Loader text="Loading dashboard..." />;
  if (!dashboardData) {
    return (
      <div className="app-loader">
        <h2 className="app-loader__title">No data available</h2>
        <p className="app-loader__text">
          Try changing the date range or check the backend response.
        </p>
      </div>
    );
  }

  const trafficChartData = {
    labels: dashboardData.trafficTrends.dates,
    datasets: [
      {
        label: "Sessions",
        data: dashboardData.trafficTrends.sessions,
        borderColor: "#4f46e5",       // Indigo
        backgroundColor: "rgba(79,70,229,0.15)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const topPagesChartData = {
    labels: dashboardData.topPages.map(p => p.page),
    datasets: [
      {
        label: "Page Views",
        data: dashboardData.topPages.map(p => p.views),
        backgroundColor: "#4f46e5", // Emerald
        borderRadius: 6,
      },
    ],
  };

  const channelChartData = {
  labels: ["Sessions", "Active Users", "Page Views"],
  datasets: [
    {
      label: "Totals",
      data: [
        dashboardData.totals.sessions,
        dashboardData.totals.activeUsers,
        dashboardData.totals.pageViews,
      ],
      backgroundColor: ["#6366f1", "#f59e0b", "#ef4444"],
    },
  ],
};

    return (
      <div className="app-layout">
          {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <img src={logo} alt="Digitalzone-Logo" className="sidebar-logo" />
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Home/> <span>GA4 Dashboard</span>
            </NavLink>
            <NavLink to="/instagram" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <FaInstagram size={25} /> <span>Instagram Analytics</span>
            </NavLink>
            <NavLink to="/googleAds" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <SiGoogleads /> <span>Google Ads Analytics</span>
            </NavLink>
            <NavLink to="/facebook" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <FaFacebook size={25} /> <span>Facebook Analytics</span>
            </NavLink>
            <NavLink to="/search-console" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <FiSearch /> <span>Search Console</span>
            </NavLink>
          </nav>
        </aside>
         {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={
            <>
          <header className="top-header">
            <h1>GA4 Analytics Dashboard</h1>
          </header>
          <div className="date-controls">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}/>
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}/>

            <div className="preset-buttons">
              <button onClick={setLast7Days}>Last 7 Days</button>
              <button onClick={setLast30Days}>Last 30 Days</button>
              <button onClick={setThisMonth}>This Month</button>
            </div>
          </div>
          <Dashboard startDate={startDate} endDate={endDate} />
          {/* Charts */}
           <div className="charts-section">
            <div className="charts-left">
              <div className="chart-card">
                <h3>Traffic Over Time</h3>
                <Line data={trafficChartData} />
              </div>

              <div className="chart-card">
                <h3>Top 5 Pages</h3>
                <Bar data={topPagesChartData} />
              </div>
            </div>

            <div className="charts-right">
              <div className="chart-card tall-card">
                <h3>Channel Performance</h3>
                <Pie data={channelChartData} />
              </div>
            </div>
          </div>
        <ChatAssistant startDate={startDate} endDate={endDate}/>
        </>
          }
        />
        <Route path="/instagram" element={<InstagramAnalytics />} />
        <Route path="/googleAds" element={<GoogleAdsAnalytics />} />
        <Route path="/facebook" element={<FacebookAnalytics />} />
        <Route path="/search-console" element={<SearchConsoleDashboard />} />
      </Routes>
      </main>
    </div>

  );
}

export default App
