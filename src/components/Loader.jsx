export default function Loader({ text = "Loading dashboard..." }) {
  return (
    <div className="app-loader">
      
      <div className="app-loader__spinner" />

      <h2 className="app-loader__title">Digitalzone Analytics</h2>
      <p className="app-loader__text">{text}</p>
    </div>
  );
}