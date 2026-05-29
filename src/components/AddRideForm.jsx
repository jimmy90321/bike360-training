import { useState } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function AddRideForm({ riderName }) {
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('normal');
  const [mood, setMood] = useState('great');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!distance || !time) return;
    setSubmitting(true);

    try {
      const ridesRef = collection(db, 'riders', riderName, 'rides');
      await addDoc(ridesRef, {
        distance: parseFloat(distance),
        time: parseFloat(time),
        location,
        status,
        mood,
        note,
        createdAt: serverTimestamp(),
      });

      // update weekly total
      const riderRef = doc(db, 'riders', riderName);
      await updateDoc(riderRef, {
        weeklyKm: (rider?.weeklyKm || 0) + parseFloat(distance),
        totalKm: (rider?.totalKm || 0) + parseFloat(distance),
      });

      setDistance('');
      setTime('');
      setLocation('');
      setNote('');
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <form className="ride-form" onSubmit={handleSubmit}>
      <h3>➕ 新增騎乘記錄</h3>
      <div className="form-row">
        <input type="number" placeholder="里程 (km)" value={distance} onChange={e => setDistance(e.target.value)} step="0.1" required />
        <input type="number" placeholder="時間 (分鐘)" value={time} onChange={e => setTime(e.target.value)} required />
      </div>
      <input type="text" placeholder="地點" value={location} onChange={e => setLocation(e.target.value)} />
      <div className="form-row">
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="normal">正常</option>
          <option value="long">長途</option>
          <option value="intervals">間歇</option>
        </select>
        <select value={mood} onChange={e => setMood(e.target.value)}>
          <option value="great">很棒 💪</option>
          <option value="good">不錯 🙂</option>
          <option value="tough">辛苦 💪</option>
        </select>
      </div>
      <textarea placeholder="備註..." value={note} onChange={e => setNote(e.target.value)} rows={2} />
      <button type="submit" disabled={submitting}>{submitting ? '上傳中...' : '記錄騎乘'}</button>
    </form>
  );
}