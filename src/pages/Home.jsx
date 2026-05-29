import { useState } from 'react';

function Home({ onEnter }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('riderName', name.trim());
      onEnter(name.trim());
    }
  };

  return (
    <div className="home">
      <div className="logo">
        <span className="logo-icon">🚴</span>
        <h1>bike360</h1>
        <p>多人騎乘訓練記錄</p>
      </div>
      <form onSubmit={handleSubmit} className="enter-form">
        <input
          type="text"
          placeholder="輸入你的名字"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          autoFocus
        />
        <button type="submit">進入訓練 🏋️</button>
      </form>
    </div>
  );
}

export default Home;