import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function AddRideForm({ riderName }) {
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('normal');
  const [mood, setMood] = useState('great');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentKm, setCurrentKm] = useState({ totalKm: 0, weeklyKm: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!riderName) return;
    const riderRef = doc(db, 'riders', riderName);
    const unsub = onSnapshot(riderRef, (snap) => {
      if (snap.exists()) {
        setCurrentKm({
          totalKm: snap.data().totalKm || 0,
          weeklyKm: snap.data().weeklyKm || 0,
        });
      }
    });
    return () => unsub();
  }, [riderName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!distance) {
      setError('請輸入里程');
      return;
    }
    setSubmitting(true);

    try {
      console.log('Submitting ride:', { riderName, distance, time, location });
      const ridesRef = collection(db, 'riders', riderName, 'rides');
      const docRef = await addDoc(ridesRef, {
        date: new Date().toISOString(),
        distance: parseFloat(distance),
        time: time ? parseFloat(time) : null,
        location,
        status,
        mood,
        note,
        createdAt: serverTimestamp(),
      });
      console.log('Ride added, doc id:', docRef.id);

      const riderRef = doc(db, 'riders', riderName);
      await updateDoc(riderRef, {
        weeklyKm: (currentKm.weeklyKm || 0) + parseFloat(distance),
        totalKm: (currentKm.totalKm || 0) + parseFloat(distance),
        lastUpdated: serverTimestamp(),
      });
      console.log('Rider updated');

      setDistance('');
      setTime('');
      setLocation('');
      setNote('');
      alert('騎乘記錄已上傳！');
    } catch (err) {
      console.error('Error:', err);
      setError('上傳失敗：' + err.toString());
    }
    setSubmitting(false);
  };

  return (
    <form className="ride-form" onSubmit={handleSubmit}>
      <h3>➕ 新增騎乘記錄</h3>
      {error && <div className="error-msg">{error}</div>}
      <div className="form-row">
        <input type="number" placeholder="里程 (km)" value={distance} onChange={e => setDistance(e.target.value)} step="0.1" required />
        <input type="number" placeholder="時間 (分鐘)" value={time} onChange={e => setTime(e.target.value)} />
      </div>
      <input type="text" placeholder="地點" value={location} onChange={e => setLocation(e.target.value)} />
      <div className="form-row">
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="normal">正常</option>
          <option value="long">長途</option>
          <option value="intervals">間歇</option>
        </select>
        <select value={mood} onChange={e => setMood(e.target.value)}>
          <option value="great">很棒</option>
          <option value="good">不錯</option>
          <option value="tough">辛苦</option>
        </select>
      </div>
      <textarea placeholder="備註..." value={note} onChange={e => setNote(e.target.value)} rows={2} />
      <button type="submit" disabled={submitting}>{submitting ? '上傳中...' : '記錄騎乘'}</button>
    </form>
  );
}
