import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import PublicBoard from './pages/PublicBoard';
import PrivateBoard from './pages/PrivateBoard';

export default function App() {
  const [riderName, setRiderName] = useState(() => localStorage.getItem('riderName') || '');

  useEffect(() => {
    if (!riderName) {
      const saved = localStorage.getItem('riderName');
      if (saved) setRiderName(saved);
    }
  }, []);

  const handleEnter = (name) => setRiderName(name);

  if (!riderName) {
    return <Home onEnter={handleEnter} />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <nav className="nav">
          <span>🚴 bike360</span>
          <div>
            <a href="/public">公開排行</a>
            <a href="/private">我的訓練</a>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate to="/private" />} />
          <Route path="/public" element={<PublicBoard riderName={riderName} />} />
          <Route path="/private" element={<PrivateBoard riderName={riderName} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}