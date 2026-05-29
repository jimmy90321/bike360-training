export default function StatsBar({ rider }) {
  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="val">{rider.totalKm?.toFixed(1) || 0}</span>
        <span className="label">總里程 (km)</span>
      </div>
      <div className="stat">
        <span className="val">{rider.weeklyKm?.toFixed(1) || 0}</span>
        <span className="label">本週 (km)</span>
      </div>
    </div>
  );
}