import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import StatsBar from '../components/StatsBar';
import AddRideForm from '../components/AddRideForm';

export default function PrivateBoard({ riderName }) {
  const [rider, setRider] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!riderName) return;
    const ref = doc(db, 'riders', riderName);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setRider({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [riderName]);

  if (loading) return <div className="loading">載入中...</div>;
  if (!rider) return <div className="loading">找不到騎士資料</div>;

  return (
    <div className="board private-board">
      <header className="board-header">
        <h1>🔒 我的訓練</h1>
        <p>歡迎回来，{riderName}</p>
      </header>
      <StatsBar rider={rider} />
      <AddRideForm riderName={riderName} />
    </div>
  );
}