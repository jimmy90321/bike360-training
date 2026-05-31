import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getYearWeek } from '../utils/week';
import WeekTabs from '../components/WeekTabs';
import Leaderboard from '../components/Leaderboard';

export default function PublicBoard({ riderName }) {
  const [riders, setRiders] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!riderName) return;
    setLoading(true);

    const yearWeek = getYearWeek(new Date());
    const targetYearWeek = getYearWeekOffset(yearWeek, selectedWeek);

    // Get all riders
    const ridersRef = collection(db, 'riders');
    const unsub = onSnapshot(ridersRef, async (snap) => {
      const riderPromises = snap.docs.map(async (riderDoc) => {
        const weekRef = doc(db, 'riders', riderDoc.id, 'weeklyData', targetYearWeek);
        const weekSnap = await getDocs(collection(db, 'riders', riderDoc.id, 'weeklyData'));
        let weeklyKm = 0;
        weekSnap.docs.forEach(w => {
          if (w.id === targetYearWeek) {
            weeklyKm = w.data().km || 0;
          }
        });
        return {
          id: riderDoc.id,
          weeklyKm,
 };
      });

      const ridersData = await Promise.all(riderPromises);
      // Sort by weekly km descending
      ridersData.sort((a, b) => b.weeklyKm - a.weeklyKm);
      setRiders(ridersData);
      setLoading(false);
    });

    return () => unsub();
  }, [riderName, selectedWeek]);

  if (loading) return <div className="loading">載入中...</div>;

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

function getYearWeekOffset(yearWeek, offset) {
  const [year, week] = yearWeek.split('-').map(Number);
  const totalWeeks = week + offset;
  if (totalWeeks <= 0) {
    return `${year - 1}-${52 + totalWeeks}`;
  } else if (totalWeeks > 52) {
    return `${year + 1}-${totalWeeks - 52}`;
  }
  return `${year}-${String(totalWeeks).padStart(2, '0')}`;
}
