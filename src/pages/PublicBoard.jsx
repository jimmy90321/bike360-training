import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import StatsBar from '../components/StatsBar';
import Leaderboard from '../components/Leaderboard';
import WeekTabs from '../components/WeekTabs';

export default function PublicBoard({ riderName }) {
  const [riders, setRiders] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'riders'), orderBy('weeklyKm', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRiders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="board public-board">
      <header className="board-header">
        <h1>🌍 公開排行榜</h1>
        <p>所有騎士的每週里程</p>
      </header>
      <WeekTabs selected={selectedWeek} onChange={setSelectedWeek} />
      <Leaderboard riders={riders} />
    </div>
  );
}