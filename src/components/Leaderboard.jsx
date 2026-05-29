export default function Leaderboard({ riders }) {
  return (
    <div className="leaderboard">
      {riders.length === 0 ? (
        <p className="empty">還沒有騎士記錄</p>
      ) : (
        riders.map((rider, i) => (
          <div key={rider.id} className={`rider-row rank-${i + 1}`}>
            <span className="rank">#{i + 1}</span>
            <span className="name">{rider.id}</span>
            <span className="km">{rider.weeklyKm?.toFixed(1) || 0} <small>km</small></span>
          </div>
        ))
      )}
    </div>
  );
}