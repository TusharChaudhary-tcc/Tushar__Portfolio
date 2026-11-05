import { useEffect, useState } from 'react';

const formatTime = (date) => date.toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit',
});

const formatDate = (date) => date.toLocaleDateString([], {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function LockScreen({ onUnlock, isExiting = false }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const clockTimer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') onUnlock();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUnlock]);

  return (
    <section className={`entry-screen lock-screen${isExiting ? ' lock-screen-exiting' : ''}`} aria-label="Portfolio lock screen">
      <div className="lock-orb lock-orb-one" aria-hidden="true" />
      <div className="lock-orb lock-orb-two" aria-hidden="true" />
      <div className="lock-stars" aria-hidden="true" />
      <div className="lock-content">
        <div className="lock-avatar-frame">
          <img src="/profile.png" alt="Tushar Chaudhary" className="lock-avatar" />
          <span className="lock-online-indicator" aria-hidden="true" />
        </div>
        <p className="lock-greeting">Welcome back</p>
        <h1>Tushar Chaudhary</h1>
        <p className="lock-designation">Aspiring Software Developer</p>
        <div className="lock-clock" aria-live="polite">{formatTime(now)}</div>
        <p className="lock-date">{formatDate(now)}</p>
        <button className="unlock-button" type="button" onClick={onUnlock}>
          <span>Press Enter to unlock</span>
          <span className="unlock-arrow" aria-hidden="true">↵</span>
        </button>
      </div>
      <div className="lock-footer" aria-hidden="true">
        <span>PORTFOLIO SESSION</span>
        <span>SIMULATED ACCESS</span>
      </div>
    </section>
  );
}
