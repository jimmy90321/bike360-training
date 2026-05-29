import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import StatsBar from '../components/StatsBar';
import AddRideForm from '../components/AddRideForm';
import WeekTabs from '../components/WeekTabs';
import RideList from '../components/RideList';

export default function PrivateBoard({ riderName }) {
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    if (!riderName) return;

    // Auto-create rider doc if not exists
    const riderRef = doc(db, 'riders', riderName);
    setDoc(riderRef, {
      name: riderName,
      totalKm: 0,
      weeklyKm: 0,
      createdAt: serverTimestamp(),
    }, { merge: true });

    const unsub = onSnapshot(riderRef, (snap) => {
      setRider(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });

    return () => unsub();
  }, [riderName]);

  if (loading) return <div className="loading">載入中...</div>;

  return (
    <div className="board private-board">
      <header className="board-header">
        <h1>🔒 我的訓練</h1>
        <p>歡迎回来，{riderName}</p>
      </header>
      <StatsBar rider={rider} />
      <AddRideForm riderName={riderName} />
      <WeekTabs selected={selectedWeek} onChange={setSelectedWeek} />
      <RideList riderName={riderName} selectedWeek={selectedWeek} />
    </div>
  );
}
