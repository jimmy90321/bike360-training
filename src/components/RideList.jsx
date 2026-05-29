import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase/config';

function getWeekDates(offset) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1 - offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth()+1}/${d.getDate()}`;
}

export default function RideList({ riderName, selectedWeek }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!riderName) return;
    setLoading(true);

    const { start, end } = getWeekDates(selectedWeek);
    const ridesRef = collection(db, 'riders', riderName, 'rides');
    const q = query(
      ridesRef,
      orderBy('date', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(r => {
          if (!r.date) return false;
          const d = new Date(r.date);
          return d >= start && d <= end;
        });
      setRides(data);
      setLoading(false);
    });

    return () => unsub();
  }, [riderName, selectedWeek]);

  if (loading) return <div className="loading">載入騎乘記錄中...</div>;
  if (rides.length === 0) return <div className="empty-rides">這週還沒有騎乘記錄</div>;

  const totalKm = rides.reduce((sum, r) => sum + (r.distance || 0), 0);

  return (
    <div className="ride-list">
      <div className="ride-list-header">
        <h3>騎乘記錄</h3>
        <span className="week-total">本週累積 {totalKm.toFixed(1)} km</span>
      </div>
      {rides.map(ride => (
        <div key={ride.id} className="ride-card">
          <div className="ride-date">{formatDate(ride.date)}</div>
          <div className="ride-info">
            <span className="ride-km">{ride.distance} km</span>
            {ride.time && <span className="ride-time">{ride.time} 分鐘</span>}
            {ride.location && <span className="ride-loc">📍 {ride.location}</span>}
          </div>
          {ride.note && <div className="ride-note">{ride.note}</div>}
        </div>
      ))}
    </div>
  );
}
