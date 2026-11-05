import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHeader } from './SnakeGame';

const LEVELS = Array.from({ length: 10 }, (_, index) => ({
  level: index + 1,
  target: { x: 70 + (index % 2) * 55, y: 18 + Math.floor(index / 2) * 14 },
  obstacleOffset: index * 3,
}));

const initialCar = { x: 50, y: 78, angle: -90, speed: 0 };

export default function PrecisionParking({ onBack }) {
  const [level, setLevel] = useState(1);
  const [car, setCar] = useState(initialCar);
  const carRef = useRef(car);
  const keys = useRef(new Set());
  const [status, setStatus] = useState('ready');
  const [time, setTime] = useState(0);
  const [collisions, setCollisions] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('parking-best') || 0));
  const [score, setScore] = useState(0);
  const frame = useRef();
  const startedAt = useRef(0);
  const currentLevel = LEVELS[level - 1];

  const restart = useCallback(() => {
    carRef.current = initialCar;
    setCar(initialCar);
    setTime(0);
    setCollisions(0);
    setScore(0);
    setStatus('playing');
    startedAt.current = performance.now();
  }, []);

  const finish = useCallback(() => {
    const accuracy = Math.max(0, 1000 - time * 8 - collisions * 100);
    const nextScore = Math.max(100, Math.round(accuracy + level * 100));
    setScore(nextScore);
    setBest((current) => {
      const next = Math.max(current, nextScore);
      localStorage.setItem('parking-best', String(next));
      return next;
    });
    setStatus('complete');
  }, [collisions, level, time]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onBack();
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', ' '].includes(event.key)) {
        event.preventDefault();
        keys.current.add(event.key.toLowerCase());
        if (status === 'ready') restart();
      }
    };
    const release = (event) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', release);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', release);
    };
  }, [onBack, restart, status]);

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const tick = (now) => {
      const elapsed = Math.floor((now - startedAt.current) / 1000);
      setTime(elapsed);
      const next = { ...carRef.current };
      const accelerating = keys.current.has('arrowup') || keys.current.has('w');
      const reversing = keys.current.has('arrowdown') || keys.current.has('s');
      const braking = keys.current.has(' ');
      const steering = (keys.current.has('arrowleft') || keys.current.has('a') ? -1 : 0) + (keys.current.has('arrowright') || keys.current.has('d') ? 1 : 0);
      if (accelerating) next.speed = Math.min(1.7, next.speed + 0.045);
      else if (reversing) next.speed = Math.max(-1, next.speed - 0.045);
      else next.speed *= braking ? 0.82 : 0.96;
      next.angle += steering * (Math.abs(next.speed) * 1.7 + 0.6);
      const radians = next.angle * Math.PI / 180;
      next.x += Math.cos(radians) * next.speed;
      next.y += Math.sin(radians) * next.speed;
      if (next.x < 7 || next.x > 93 || next.y < 8 || next.y > 92) {
        next.x = Math.max(7, Math.min(93, next.x));
        next.y = Math.max(8, Math.min(92, next.y));
        next.speed *= -0.35;
        setCollisions((value) => value + 1);
      }
      const distance = Math.hypot(next.x - currentLevel.target.x, next.y - currentLevel.target.y);
      if (distance < 7 && Math.abs(next.speed) < 0.25) finish();
      carRef.current = next;
      setCar(next);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [currentLevel.target.x, currentLevel.target.y, finish, status]);

  const nextLevel = () => {
    if (level < 10) {
      setLevel((value) => value + 1);
      restart();
    } else setStatus('won');
  };

  return <div className="game-screen parking-game">
    <GameHeader title="PRECISION PARKING" subtitle="Thread the lot, settle into the bay, and park clean." onBack={onBack} onRestart={restart} />
    <div className="game-stats"><span>LEVEL <strong>{level}/10</strong></span><span>TIME <strong>{time}s</strong></span><span>SCORE <strong>{score}</strong></span><span>BEST <strong>{best}</strong></span></div>
    <div className="parking-lot">
      <div className="parking-sun" />
      {Array.from({ length: 7 }, (_, index) => <div key={index} className="parking-lane" style={{ left: `${18 + index * 11}%` }} />)}
      <div className="parking-target" style={{ left: `${currentLevel.target.x}%`, top: `${currentLevel.target.y}%` }}>PARK</div>
      {Array.from({ length: 5 }, (_, index) => <div key={index} className={`parked-car parked-car-${index % 3}`} style={{ left: `${12 + ((index + currentLevel.obstacleOffset) % 6) * 13}%`, top: `${28 + (index % 2) * 34}%` }} />)}
      {Array.from({ length: 4 }, (_, index) => <div key={index} className="parking-cone" style={{ left: `${20 + index * 19}%`, top: `${12 + (index % 2) * 70}%` }} />)}
      <div className="player-car" style={{ left: `${car.x}%`, top: `${car.y}%`, transform: `translate(-50%, -50%) rotate(${car.angle + 90}deg)` }}><span /></div>
    </div>
    <div className="parking-controls"><span>↑ ACCELERATE</span><span>↓ REVERSE</span><span>← → STEER</span><span>SPACE HANDBRAKE</span></div>
    {status === 'ready' && <div className="game-overlay"><strong>LEVEL {level}</strong><button type="button" onClick={restart}>Start Drive</button></div>}
    {(status === 'complete' || status === 'won') && <div className="game-overlay"><strong>{status === 'won' ? 'LOT MASTER' : 'PERFECT PARKING'}</strong><span>Score {score} · {collisions} collisions</span><button type="button" onClick={nextLevel}>{level < 10 ? 'Next Level' : 'Play Again'}</button></div>}
  </div>;
}
