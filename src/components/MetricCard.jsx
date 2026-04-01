export default function MetricCards({ title, value, icon, color = "#4f46e5" }) {
  return (
    <div className="metric-card">
      <div className="card-header">
        <span className="card-title">{title}</span>
        <span className="card-icon" style={{ color }}>
          {icon}
        </span>
      </div>
      <div className="card-value">{value}</div>
    </div>
  );
}