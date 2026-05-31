import { useState } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getYearWeek } from '../utils/week';

export default function AddRideForm({ riderName }) {
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('normal');
  const [mood, setMood] = useState('great');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!distance) {
      setError('請輸入里程');
      return;
    }
    setSubmitting(true);

    try {
      const now = new Date();
      const yearWeek = getYearWeek(now);
      const weekRef = doc(db, 'riders', riderName, 'weeklyData', yearWeek);

      // Read current week data
      const snap = await getDoc(weekRef);
      const currentWeekKm = snap.data()?.km || 0;

      // Add ride record
      const ridesRef = collection(db, 'riders', riderName, 'rides');
      await addDoc(ridesRef, {
        date: now.toISOString(),
        distance: parseFloat(distance),
        time: time ? parseFloat(time) : null,
        location,
        status,
        mood,
        note,
        yearWeek,
        createdAt: serverTimestamp(),
      });

      // Update weekly total
      await setDoc(weekRef, {
        km: currentWeekKm + parseFloat(distance),
        weekStart: getWeekStartDate(now),
        updatedAt: serverTimestamp(),
      });

      // Update rider's totalKm (cumulative, never reset)
      const riderRef = doc(db, 'riders', riderName);
      const riderSnap = await getDoc(riderRef);
      const currentTotalKm = riderSnap.data()?.totalKm || 0;
      await updateDoc(riderRef, {
        totalKm: currentTotalKm + parseFloat(distance),
        lastUpdated: serverTimestamp(),
      });

      setDistance('');
      setTime('');
      setLocation('');
      setNote('');
      setSuccess('已上傳！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      setError('上傳失敗：' + err.message);
    }
    setSubmitting(false);
  };

  return (
    <form className="ride-form" onSubmit={handleSubmit}>
      <h3>➕ 新增騎乘記錄</h3>
      {error && <div className="error-msg" style={{color:'red',marginBottom:'10px'}}>{error}</div>}
      {success && <div className="success-msg" style={{color:'#06d6a0',marginBottom:'10px'}}>{success}</div>}
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
      <div className="form-row" style={{fontSize:'0.75rem',color:'#6b7280',marginBottom:'8px'}}>
        <span>狀態</span>
        <span>心情</span>
      </div>
      <textarea placeholder="備註..." value={note} onChange={e => setNote(e.target.value)} rows={2} />
      <button type="submit" disabled={submitting}>{submitting ? '上傳中...' : '記錄騎乘'}</button>
    </form>
  );
}

function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}
